from __future__ import annotations

import json
import os
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
CONTENT_DIR = PROJECT_ROOT / "content"
ASSETS_DIR = PROJECT_ROOT / "assets"

load_dotenv(BASE_DIR / ".env")


def _parse_origins(value: str | None) -> list[str]:
    if not value:
        return ["http://localhost:3002"]

    if value.lstrip().startswith("["):
        origins = json.loads(value)
        if not isinstance(origins, list) or not all(isinstance(origin, str) for origin in origins):
            raise ValueError("CORS_ORIGINS must be a JSON array of strings")
        return [origin.strip() for origin in origins if origin.strip()]

    return [origin.strip() for origin in value.split(",") if origin.strip()]


CORS_ORIGINS = _parse_origins(os.getenv("CORS_ORIGINS"))
