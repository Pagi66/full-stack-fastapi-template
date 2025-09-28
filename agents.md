### Implementation Update (2025-09-27)
- Added execution event ledger and migration `b2b5c37d8734_add_execution_events.py` to persist simulation activity and manual adjustments.
- Exposed enriched balances via `/users/me` (available, allocated, total) and integrated zero-balance seeding through the reusable balance reset service.
- Introduced admin simulation APIs and dashboard controls to run copy simulations and post manual profit events.
- Broadened React Query invalidation after copy-trading mutations so dashboard telemetry and the live feed refresh automatically.
- Added `test_admin_simulations.py` coverage for manual profit events and simulation triggers.

### Verification
- `python -m pytest app/tests/api/routes/test_copy_trading.py --maxfail=1 -q`
- `python -m pytest app/tests/api/routes/test_admin_simulations.py --maxfail=1 -q` (unable to execute in current environment; pending runtime availability)

### Checklist Status
- **Reset Baselines**: DONE — Migration and seed helper now zero balances and `/users/me` returns updated totals.
- **Balance Propagation**: DONE — Copy-trading mutations invalidate `currentUser`, dashboard summaries, and the execution feed.
- **Admin Simulation Controls**: DONE — Backend endpoints and admin UI buttons support simulations and manual profits.
- **Live Execution Feed**: DONE — Execution event API with polling feed replaces the static dashboard list.
- **Testing & Telemetry**: IN PROGRESS — New targeted backend tests added; wider telemetry automation remains outstanding once runtimes allow full suite.
