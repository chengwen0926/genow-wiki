from __future__ import annotations

import os
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
CONTENT_DIR = PROJECT_ROOT / "content"
ASSETS_DIR = PROJECT_ROOT / "assets"


def _parse_origins(value: str | None) -> list[str]:
    if not value:
        return ["http://localhost:3002"]
    return [origin.strip() for origin in value.split(",") if origin.strip()]


CORS_ORIGINS = _parse_origins(os.getenv("CORS_ORIGINS"))
