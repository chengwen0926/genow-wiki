from __future__ import annotations

import re
from pathlib import Path
from typing import TypedDict


HEADING_RE = re.compile(r"^(#{1,6})\s+(.+?)\s*$", re.MULTILINE)
TITLE_RE = re.compile(r"^#\s+(.+?)\s*$", re.MULTILINE)
PAGE_ORDER = {
    "console-mode": 0,
    "canvas-mode": 1,
    "history": 2,
    "sketch-mode": 3,
    "other": 4,
}


class TreeNode(TypedDict):
    type: str
    name: str
    title: str
    slug: str | None
    children: list["TreeNode"]


def prettify_name(value: str) -> str:
    return value.replace("-", " ").replace("_", " ").strip().title()


def extract_title(markdown: str, fallback: str) -> str:
    match = TITLE_RE.search(markdown)
    if match:
        return match.group(1).strip()
    return prettify_name(fallback)


def extract_headings(markdown: str) -> list[dict[str, str | int]]:
    headings: list[dict[str, str | int]] = []
    for hashes, text in HEADING_RE.findall(markdown):
        headings.append(
            {
                "level": len(hashes),
                "text": text.strip(),
                "id": slugify(text),
            }
        )
    return headings


def slugify(value: str) -> str:
    normalized = re.sub(r"[^\w\s-]", "", value, flags=re.UNICODE).strip().lower()
    return re.sub(r"[-\s]+", "-", normalized)


def resolve_markdown_file(content_dir: Path, slug: str) -> Path:
    normalized = slug.strip("/").replace("\\", "/")
    if not normalized:
        normalized = "welcome"

    candidate = (content_dir / f"{normalized}.md").resolve()
    if content_dir.resolve() not in candidate.parents and candidate != content_dir.resolve():
        raise ValueError("invalid page path")
    return candidate


def build_tree(content_dir: Path) -> list[TreeNode]:
    def sort_key(entry: Path) -> tuple[int, int, str]:
        if entry.is_dir():
            return (0, PAGE_ORDER.get(entry.name, 999), entry.name.lower())
        stem = entry.stem if entry.suffix.lower() == ".md" else entry.name
        return (1, PAGE_ORDER.get(stem, 999), entry.name.lower())

    def walk(directory: Path) -> list[TreeNode]:
        nodes: list[TreeNode] = []
        entries = sorted(
            [entry for entry in directory.iterdir() if not entry.name.startswith(".")],
            key=sort_key,
        )
        for entry in entries:
            if entry.is_dir():
                children = walk(entry)
                if children:
                    nodes.append(
                        {
                            "type": "directory",
                            "name": entry.name,
                            "title": prettify_name(entry.name),
                            "slug": None,
                            "children": children,
                        }
                    )
            elif entry.suffix.lower() == ".md":
                relative = entry.relative_to(content_dir).with_suffix("")
                markdown = entry.read_text(encoding="utf-8")
                nodes.append(
                    {
                        "type": "page",
                        "name": entry.stem,
                        "title": extract_title(markdown, entry.stem),
                        "slug": relative.as_posix(),
                        "children": [],
                    }
                )
        return nodes

    return walk(content_dir)


def find_first_page_slug(tree: list[TreeNode]) -> str | None:
    for node in tree:
        if node["type"] == "page" and node["slug"]:
            return node["slug"]
        if node["children"]:
            slug = find_first_page_slug(node["children"])
            if slug:
                return slug
    return None
