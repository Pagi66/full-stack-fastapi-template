# Codebase Analysis Summary

## Project Snapshot

- Stack: FastAPI backend (`backend/app`), React 19 with TanStack Router and TanStack Query frontend (`frontend/src`), PostgreSQL via SQLModel, Docker-first infrastructure.
- Key Customizations: UUID primary keys, Untitled UI component library, TanStack file-based routing, generated OpenAPI client, experimental AI chat stub.
- Docs vs Reality: Several docs (for example `frontend/docs/AUTHENTICATION.md`) still reference deprecated helpers such as `frontend/src/services/api.ts`.

## Architecture Highlights
- Backend: `backend/app/main.py` and `backend/app/api/main.py` compose modular routers for auth, users, items, and transactions; `backend/app/core/config.py` enforces environment separation and secret validation.
- Real-time Channel: `/ws/chat/{user_id}` couples to `backend/app/services/ai/orchestrator.py`, currently a stubbed orchestrator.
- Frontend Boot: `frontend/src/main.tsx` wires TanStack Query, auth provider, theme provider, and router.
- Auth Context: `frontend/src/providers/auth-provider.tsx` manages login/logout with TanStack Query, persists tokens to `localStorage`, and coordinates TanStack Router redirects.

## SEEP Analysis

### Security
- JWT handling centralised in `backend/app/core/security.py`, but the file still contains duplicated imports/definitions from a merge, increasing drift risk.
- WebSocket auth expects `user_id` as `int` but compares against UUIDs (`backend/app/api/api_v1/endpoints/chat.py`), enabling mismatches.
- Frontend stores tokens but the generated client (e.g., `frontend/src/api/core/OpenAPI.ts`) never reads them, so authenticated calls can fail without an interceptor.
- Auth error handling relies on window events instead of a central interceptor, leaving gaps around automated token refresh.

### Efficiency
- Pagination exists but SQLModel queries lack indexes/optimization hints for high-volume reads.
- Default five-minute `staleTime` in TanStack Query (`frontend/src/main.tsx`) requires careful invalidation on mutations.
- Email/password reset endpoints run synchronously (`backend/app/api/routes/login.py`), which can block workers on slow SMTP.

### Extensibility
- UUID-based models and modular routers simplify adding services.
- Generated OpenAPI client (`frontend/src/api/index.ts`) accelerates new endpoints once token plumbing is restored.
- AI orchestrator stub isolates future LLM integration behind an async contract.
- Route guards (`frontend/src/components/auth/route-guard.tsx`) keep auth handling consistent, though router-history coupling may need updates as TanStack evolves.

### Performance
- Frontend benefits from TanStack Router code-splitting and lightweight Untitled UI components.
- Backend relies on synchronous SQLModel sessions; throughput hinges on DB tuning and worker scaling.
- WebSocket loop simulates 50 ms latency per message; real integrations must consider backpressure.

## Key Recommendations
1. Reintroduce token plumbing for the generated client to ensure Authorization headers are set consistently.
2. Enforce UUID parsing/validation for WebSocket `user_id` and tighten related auth checks.
3. Deduplicate and harden `backend/app/core/security.py` to align with the FastAPI OAuth2 JWT patterns.
4. Update documentation (auth + ops) to match the TanStack-centric frontend stack.
5. Add operational safeguards: structured logging, rate limiting, and async email dispatch.


## Test Credentials
- Admin: admin@example.com / Admin123!
- User: user@example.com / User1234!

## Implementation Plan (Rev 2025-09-20)

### Phase 1  Frontend Token Plumbing & Docs
1. Start `docker compose watch` from the repository root to stream frontend/backend rebuilds while editing auth utilities; confirm the watch output shows the tracked services (ref: `docker compose watch` docs).
2. Wire persisted tokens into the generated client (`frontend/src/api/core/OpenAPI.ts`, `frontend/src/api/core/request.ts`) using an in-memory accessor that reads from secure storage just-in-time, aligning with OWASP JWT storage advice to minimise XSS exposure.
3. Update TanStack Query auth hooks to inject the refreshed Authorization header and trigger targeted `queryClient.invalidateQueries` calls after login/logout, following TanStack Query mutation guidance.
4. Refresh `frontend/docs/AUTHENTICATION.md` so it reflects the regenerated client flow and clarifies token lifecycle expectations.
5. Exercise an authenticated frontend route while `docker compose watch` runs; verify logs display authorised API calls and no 401 events remain.
6. Run `git status` to confirm only expected frontend and docs files changed, then capture the phase with `git commit -am "fix: wire tokens into generated client"` before moving forward.

### Phase 2  Backend Security & WebSocket Alignment
1. Keep `docker compose watch` active to rebuild the backend service as security modules are edited.
2. Clean `backend/app/core/security.py` by removing duplicate imports and definitions, ensuring the module matches the FastAPI OAuth2 with JWT reference implementation (ref: FastAPI OAuth2 JWT tutorial).
3. Update `/ws/chat/{user_id}` in `backend/app/api/api_v1/endpoints/chat.py` to require UUID parsing/validation and align comparisons with the database schema, closing the auth bypass noted in the analysis.
4. Add or adjust automated checks (unit tests or integration harness) to cover the UUID path and JWT helpers; monitor watch output for successful test executions.
5. Smoke-test the WebSocket channel locally to ensure UUID enforcement and token validation both succeed while the watch logs remain clean.
6. Review `git status`, stage the backend changes, and execute `git commit -am "fix: tighten security module and websocket auth"` to seal the phase.

### Phase 3  Operational Hardening & Documentation Sync
1. Continue running (or restart) `docker compose watch` so service restarts surface regressions while introducing logging and rate limiting.
2. Add structured request logging, rate limiting, and async email dispatch hooks per the roadmap; reuse FastAPI background task patterns where possible to stay non-blocking.
3. Verify operational enhancements by hitting key endpoints and watching for log cleanliness, performance stability, and absence of blocking calls while watch is active.
4. Update deployment and ops documentation (e.g., `frontend/docs/AUTHENTICATION.md`, onboarding guides) to detail the new safeguards and monitoring expectations.
5. Once validation passes, stage the changes and run `git commit -am "chore: add operational safeguards and docs"` to preserve the state before broader QA.

## Best Practice Alignment References
- FastAPI OAuth2 JWT guidance reinforces proper password hashing, token subject usage, and dependency wiring for `get_current_user` flows (FastAPI docs: OAuth2 with Password (and hashing), Bearer with JWT tokens).
- OWASP JWT Cheat Sheet recommends strong secrets, minimising client-side token exposure, and scoping Authorization headers to trusted origins.
- TanStack Query React mutation guide highlights targeted invalidation and mutation defaults to keep cached auth state coherent after credential changes.
- `docker compose watch` documentation stresses limiting watch rules to build-sourced services, configuring sync/rebuild actions, and ensuring container users can write to sync targets.

## Change Tracking Instructions
- After each implementation activity, append a dated entry under Implementation Log describing the change, related git commit (if any), and validation status; keep entries in chronological order.
- Note `docker compose watch` state (running/stopped) and test outcomes for every logged change.
- If a phase task cannot be completed, record the blocker and recommended next steps before closing the entry.

## Implementation Log
- 2025-09-20T13:00:36+01:00 | Added phased implementation plan, best-practice references, and change-tracking instructions; next action is Phase 1 step 1 (`docker compose watch`).
- 2025-09-20T13:41:35+01:00 | Phase 1 steps 1-4: attempted to launch `docker compose watch` (background job exits immediately in CLI sandbox), added runtime OpenAPI token plumbing (`frontend/src/api/client-config.ts`, `frontend/src/main.tsx`, `frontend/src/providers/auth-provider.tsx`), and refreshed documentation (`frontend/docs/AUTHENTICATION.md`); awaiting manual UI verification and commit.
- 2025-09-20T14:54:07+01:00 | Established RBAC schema and migrations, exposed new admin/user portfolio endpoints, rebuilt frontend dashboards with TanStack Query hooks, and updated docs/tests compilation; next validation step is end-to-end workflow smoke tests before commit.
- 2025-09-20T15:05:00+01:00 | Seeded demo admin/user accounts via init_db (backend/app/core/db.py) for easy role testing; rerun migrations then restart prestart to apply.
- 2025-09-20T16:19:41+01:00 | Rebuilt backend image with latest schema, reran `docker compose up --build prestart` to run migrations and seed data (only passlib warning), confirmed `docker compose run --rm backend alembic current` reports b83cf1b7a582 head, then `docker compose down` to clean up; ready for UI smoke tests.
- 2025-09-20T16:42:19+01:00 | Documented seeded admin/user credentials in Test Credentials section for quick iteration.
- 2025-09-20T17:11:36+01:00 | Restarted containers, confirmed backend login request succeeds (200) via curl, fixed missing Message imports in performance/trades routes, and updated frontend auth routing to use router.navigate after diagnosing post-login redirect.
- 2025-09-20T17:48:22+01:00 | Cleaned generated UsersService balance overload, adjusted admin dashboard/user dashboard UI props (valid badge/button colors, safe fallbacks), removed date-fns dependency in favor of Intl formatting, and rebuilt frontend image successfully via docker compose (tsc + vite now pass).
- 2025-09-20T18:12:45+01:00 | Updated auth-provider login mutation to send grant_type=password and stop sending empty client fields; docker compose watch running, UI retest pending.
- 2025-09-20T18:58:12+01:00 | Forced post-login user hydration via LoginService.loginTestToken and cleared tokens on failure so dashboards receive Authorization immediately; docker compose watch running, need browser retest.
- 2025-09-20T19:47:02+01:00 | Rebuilt frontend/backend images via docker compose up --build, confirmed API tokens for admin/user succeed inside containers after role normalisation tweak pending UI retest.
- 2025-09-20T20:02:25+01:00 | Login post-success now sets user state immediately for role-based guards; rebuilt services and re-verified admin token fetch in container.
