# Backend

FastAPI service that exposes wiki metadata and markdown page content.

## Run with uv

```bash
uv sync
uv run python main.py
```

The server reads its startup configuration from `.env`. Copy the example before
starting it in a new environment:

```bash
cp .env.example .env
```

The example listens on `http://127.0.0.1:8002` for use behind a reverse proxy.
Shell environment variables take precedence over values in `.env`:

```bash
HOST=127.0.0.1 PORT=9000 RELOAD=false uv run python main.py
```

`CORS_ORIGINS` accepts either a JSON array or a comma-separated list. Origins
must include the exact scheme, host, and port used by the browser.
