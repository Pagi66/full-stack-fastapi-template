## End-to-end feature checklist

To add a new backend+frontend feature:
1. **Backend**: Add a SQLModel model (if needed) in `backend/app/models.py`, CRUD in `crud.py`, and a route in `app/api/` (expose in `api/main.py`).
2. **Migrations**: Run Alembic revision/upgrade if models change.
3. **OpenAPI/client**: Run `./scripts/generate-client.sh` to update the frontend client after backend API changes.
4. **Frontend route**: Add a file under `frontend/src/routes/` and export `Route = createFileRoute(path)({ component })`.
5. **Data access**: Use generated client (e.g., `ItemsService`) and React Query for queries/mutations. Invalidate queries on mutation settle.
6. **UI**: Use Chakra UI and shared primitives from `src/components/ui/*`.
7. **Test**: Add/extend tests in backend (`backend/app/tests/`) and frontend (`frontend/tests/`).

## Auth-guarding routes (frontend)

To require authentication for a route/component, use the `useAuth()` hook and redirect if not logged in:

```tsx
import { useNavigate } from "@tanstack/react-router"
import useAuth from "@/hooks/useAuth"

function ProtectedPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  if (!user) {
    navigate({ to: "/login" })
    return null
  }
  // ...render protected content
}
```

See `src/routes/_layout/index.tsx` for a usage example.
# Copilot project instructions

Use these notes to be productive immediately in this codebase. Keep guidance concrete and specific to this repo; prefer doing over asking.

## Architecture overview
- Monorepo with Docker Compose stack: PostgreSQL (db), FastAPI backend, React/Vite frontend, Traefik proxy, Adminer, MailCatcher.
- Backend (FastAPI + SQLModel + Alembic): `backend/app/`
  - Models: `models.py`; DB engine/session: `core/db.py`; Auth/security: `core/security.py`.
  - API: `app/api/main.py` mounts versioned routes under `/api/v1`. Health check: `GET /api/v1/utils/health-check/`.
  - CRUD helpers: `crud.py`. Email templates: `email-templates/{src,build}`.
  - WebSocket AI chat (stub orchestrator): `services/ai/` and `ws` route `/api/v1/ws/chat/{user_id}`. Requires JWT via `?token=<JWT>`; `sub` must match `user_id`.
- Frontend (React + Vite + Chakra + TanStack Router/Query): `frontend/`
  - Generated API client: `src/client/*` from backend OpenAPI via `@hey-api/openapi-ts`.
  - Routes/pages: `src/routes/` with router, UI in `src/components/`, theme in `src/theme.tsx`.

## Local development
- Easiest: run the stack with live reload and Traefik routing.
  - Start/auto-rebuild: `docker compose watch`
  - Default dev URLs: backend `http://localhost:8000`, frontend `http://localhost:5173`, docs `http://localhost:8000/docs`, Adminer `http://localhost:8080`, Traefik `http://localhost:8090`.
  - Optional local domains: set `DOMAIN=localhost.tiangolo.com` in `.env` to use `api.localhost.tiangolo.com` and `dashboard.localhost.tiangolo.com`.
- You can develop services outside Docker on same ports:
  - Stop `frontend` container, then `cd frontend; npm run dev` (serves on 5173).
  - Stop `backend` container, then `cd backend; fastapi dev app/main.py` (serves on 8000).

## Backend conventions
- Python env and deps managed with `uv`.
  - Install deps: `uv sync`; venv: `backend/.venv`.
  - Linters/typecheckers: Ruff (configured in `pyproject.toml`), MyPy strict, Pre-commit hooks.
- Data layer with SQLModel; migrate with Alembic.
  - Create revision: `docker compose exec backend alembic revision --autogenerate -m "<msg>"`; apply: `alembic upgrade head`.
- Settings from `.env`; change all `changethis` secrets before deploy (`SECRET_KEY`, `FIRST_SUPERUSER_PASSWORD`, `POSTGRES_PASSWORD`, etc.).

## Frontend conventions
- Node version via `.nvmrc`; use `fnm` or `nvm`.
- Scripts (see `frontend/package.json`):
  - `npm run dev`, `npm run build`, `npm run lint` (Biome), `npm run generate-client` (OpenAPI client).
- Configure remote API with `VITE_API_URL` (Docker build args and `.env`).

## Frontend patterns (copy these)
- Routing: file-based with TanStack Router. Create routes under `frontend/src/routes/**` and export `Route = createFileRoute(path)({ component })`. See `src/routes/_layout/items.tsx` and `src/routes/_layout/index.tsx`.
- Queries: use React Query with stable keys. For lists, prefer `['items', { page }]` with a helper like `getItemsQueryOptions({ page })` returning `{ queryKey, queryFn }` and `placeholderData: prev => prev` to reduce flicker. Example in `src/routes/_layout/items.tsx`.
- Mutations: use generated client services and invalidate list keys on settle. Example in `src/components/Items/AddItem.tsx`:
  - Input type: `ItemCreate`; call: `ItemsService.createItem({ requestBody })`.
  - Errors: catch `ApiError` and delegate to `handleError` from `src/utils`.
  - Cache: `queryClient.invalidateQueries({ queryKey: ['items'] })`.
- Generated client: import from `@/client` which re-exports `ItemsService`, `ApiError`, `OpenAPI`, and generated types. Entry file: `src/client/index.ts`.
- API base/auth: prefer `VITE_API_URL`; if needed at runtime, set `OpenAPI.BASE` and `OpenAPI.TOKEN` early (e.g., in `main.tsx`).
- UI primitives: reuse shared components under `src/components/ui/*` (dialog, field, pagination) and Chakra UI for consistency.

## API client generation flow
- Preferred script: `./scripts/generate-client.sh` from repo root:
  - Exports backend OpenAPI to `frontend/openapi.json`, runs `openapi-ts`, formats with Biome, updates `src/client/*`.
- Run this whenever backend OpenAPI changes.

## Tests and CI
- Backend tests: `bash ./scripts/test.sh` (Pytest). If stack is running: `docker compose exec backend bash scripts/tests-start.sh [pytest-args]`.
- Frontend E2E: bring up backend/mailcatcher then `npx playwright test` (UI: `--ui`). Playwright service also has a Docker target.
- GitHub Actions workflows exist for linting, backend tests, client generation, and deployments (`.github/workflows/*`).

## Deployment model
- Dockerized services behind Traefik. Production/staging require an external Traefik network; local uses internal proxy (see `docker-compose.override.yml`).
- Configure domains and secrets via environment variables and `.env`.

## Patterns to follow
- Version API under `/api/v1`; add new routes in `backend/app/api/` and expose in `app/api/main.py`.
- Put SQLModel models in `models.py`; update Alembic migrations on schema changes.
- Frontend data access via generated client in `src/client/sdk.gen.ts`; avoid hand-written fetch unless necessary.
- Use Chakra UI components and TanStack Router/Query patterns as in existing pages under `src/routes/`.

## Handy references
- Health check endpoint used by Docker: `GET /api/v1/utils/health-check/`.
- CORS and frontend origin configured via `BACKEND_CORS_ORIGINS` and `FRONTEND_HOST` envs in compose files.
- Mail sending uses `emails` + Jinja templates; local MailCatcher UI: `http://localhost:1080`.

If any of these are unclear or you spot drift between docs and code (e.g., new routes/modules), call it out and I’ll update this file.