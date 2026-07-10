from __future__ import annotations

import os

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import ASSETS_DIR, CONTENT_DIR, CORS_ORIGINS
from wiki import build_tree, extract_headings, extract_title, find_first_page_slug, resolve_markdown_file


app = FastAPI(title="Genow Wiki Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["GET"],
    allow_headers=["*"],
)

if ASSETS_DIR.exists():
    app.mount("/media", StaticFiles(directory=ASSETS_DIR), name="media")


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/wiki/tree")
async def wiki_tree() -> dict:
    if not CONTENT_DIR.exists():
        raise HTTPException(status_code=500, detail="content directory is missing")

    tree = build_tree(CONTENT_DIR)
    return {
        "tree": tree,
        "default_slug": find_first_page_slug(tree),
    }


@app.get("/api/wiki/page/{slug:path}")
async def wiki_page(slug: str) -> dict:
    try:
        file_path = resolve_markdown_file(CONTENT_DIR, slug)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="page not found")

    markdown = file_path.read_text(encoding="utf-8")
    relative_slug = file_path.relative_to(CONTENT_DIR).with_suffix("").as_posix()
    return {
        "slug": relative_slug,
        "title": extract_title(markdown, file_path.stem),
        "content": markdown,
        "headings": extract_headings(markdown),
        "updated_at": file_path.stat().st_mtime,
    }


@app.get("/api/wiki/page")
async def wiki_default_page() -> dict:
    tree = build_tree(CONTENT_DIR)
    default_slug = find_first_page_slug(tree)
    if not default_slug:
        raise HTTPException(status_code=404, detail="no pages found")
    return await wiki_page(default_slug)


def main() -> None:
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8002"))
    reload_enabled = os.getenv("RELOAD", "true").lower() in {"1", "true", "yes", "on"}

    # Use the import string so `python main.py` still supports auto-reload.
    uvicorn.run("main:app", host=host, port=port, reload=reload_enabled)


if __name__ == "__main__":
    main()
