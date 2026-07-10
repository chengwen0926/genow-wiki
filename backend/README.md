# Backend

FastAPI service that exposes wiki metadata and markdown page content.

## Run with uv

```bash
uv sync
uv run python main.py
```

The server listens on `http://localhost:8002` by default.

You can override the startup values with environment variables:

```bash
HOST=127.0.0.1 PORT=9000 RELOAD=false uv run python main.py
```
