# Genow Wiki

A full-stack wiki app with a FastAPI backend and a Next.js frontend.

## Structure

- `backend/`: FastAPI API for wiki tree and page content
- `frontend/`: Next.js app with a frosted-glass two-pane wiki UI
- `content/`: Markdown documents served by the backend

## Backend

```bash
cd backend
uv sync
uv run python main.py
```

The API runs on `http://localhost:8002`.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

The web app runs on `http://localhost:3002`.

## API

- `GET /api/health`
- `GET /api/wiki/tree`
- `GET /api/wiki/page/{slug:path}`
