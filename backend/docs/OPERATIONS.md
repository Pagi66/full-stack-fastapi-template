# Backend Operational Safeguards

## Overview

The backend now ships with structured logging, in-memory rate limiting, Prometheus metrics, and asynchronous email dispatch to harden day-to-day operations. This guide summarises behaviour, configuration knobs, and quick validation commands for each safeguard.

## Structured Logging

- Logging is configured at application start by `app.core.logging_config.configure_logging`.
- Set `LOG_LEVEL` (default `INFO`) and `LOG_JSON` (default `True`) in `.env` to control verbosity and formatting.
- When `LOG_JSON=True`, every log line is emitted as a single JSON object with `timestamp`, `level`, `logger`, and `message` fields for ingestion by systems such as Loki, Datadog, or ELK.
- Toggle to human-readable output by setting `LOG_JSON=False`.

### Verification

Run `docker compose logs backend --tail 10` during API traffic and confirm entries render as compact JSON.

## Rate Limiting

- `app.core.rate_limiter.RateLimiterMiddleware` throttles repeated requests based on client IP.
- Default settings:
  - `RATE_LIMIT_ENABLED=True`
  - `RATE_LIMIT_MAX_REQUESTS=100`
  - `RATE_LIMIT_WINDOW_SECONDS=60`
  - `RATE_LIMIT_EXCLUDE_PATHS=['/api/v1/utils/health-check/', '/api/v1/utils/metrics']`
- Update `.env` to tune the threshold or disable it entirely (`RATE_LIMIT_ENABLED=False`).

### Verification

```bash
# Temporarily reduce the limit for local testing
export RATE_LIMIT_MAX_REQUESTS=3
export RATE_LIMIT_WINDOW_SECONDS=30

# Issue four calls; the last should return 429 with Retry-After
for _ in 1 2 3 4; do
  docker compose exec backend curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/api/v1/items/
done
```

Reset the variables or restart the stack afterwards to restore defaults.

## Prometheus Metrics

- `app.core.metrics.MetricsMiddleware` captures request counts and latencies when `METRICS_ENABLED=True` (default).
- SQLAlchemy engines are instrumented via `register_sqlalchemy_metrics`, exposing query counters (`app_db_query_total`) and histograms (`app_db_query_duration_seconds`).
- Metrics are exposed at `GET /api/v1/utils/metrics` using the Prometheus text exposition format and excluded from rate limiting.
- Use a Prometheus server or any compatible scraper to ingest the endpoint; ensure network policies allow access from your monitoring environment only.

### Verification

```bash
docker compose exec backend curl http://localhost:8000/api/v1/utils/metrics | head
```

The response should list metrics such as `app_request_total`, `app_request_duration_seconds_bucket`, `app_db_query_total`, and `app_db_query_duration_seconds_bucket`.

## Dashboards & Alerting

- **Prometheus scrape config** — add the backend service to your Prometheus targets (example `prometheus.yml` snippet):
  ```yaml
  scrape_configs:
    - job_name: "fastapi-backend"
      metrics_path: /api/v1/utils/metrics
      static_configs:
        - targets: ["backend:8000"]
  ```
- **Grafana dashboard seed** — chart traffic with `sum(rate(app_request_total{status_code!="500"}[5m]))` and latency percentiles via `histogram_quantile(0.95, sum(rate(app_request_duration_seconds_bucket[5m])) by (le))`.
- **Database hot-spot alert** — fire an alert when query latency spikes:
  ```yaml
  - alert: FastAPIDatabaseP99High
    expr: histogram_quantile(0.99, sum(rate(app_db_query_duration_seconds_bucket[5m])) by (le)) > 0.5
    for: 10m
    labels:
      severity: warning
    annotations:
      summary: "FastAPI DB latency elevated (p99 > 500ms)"
  ```
- **Error surge alert** — reuse `app_request_total` with `status_code="500"` to monitor API error bursts.

## Asynchronous Email Dispatch

- `app.utils.send_email` offloads SMTP operations to a background thread via AnyIO so API handlers return quickly.
- Required `.env` variables:
  - `SMTP_HOST`
  - `SMTP_PORT`
  - `SMTP_USER` / `SMTP_PASSWORD` when authentication is needed
  - `EMAILS_FROM_EMAIL`
  - `EMAILS_FROM_NAME` (defaults to `PROJECT_NAME` when omitted)
- Successful sends log an `email_dispatched` entry with recipient, subject, and SMTP response for traceability.

### Verification

1. Configure SMTP credentials (MailHog or a similar sandbox is recommended in development).
2. Trigger `POST /api/v1/login/password-recovery/{email}`.
3. Inspect backend logs for the `email_dispatched` record and verify reception via your SMTP sink.

## Operations Checklist

- [ ] Confirm structured logs arrive in your observability stack with expected fields.
- [ ] Exercise the rate limiter and ensure alerting thresholds catch spikes in `429` responses.
- [ ] Scrape the `/api/v1/utils/metrics` endpoint and chart `app_request_total` or latency histograms.
- [ ] Watch the new database metrics (`app_db_query_total`, `app_db_query_duration_seconds`) for slow-query hotspots.
- [ ] Send a password recovery email and verify delivery latency stays low under load.
- [ ] Document overrides for `LOG_LEVEL`, `RATE_LIMIT_*`, `METRICS_ENABLED`, and SMTP credentials in deployment runbooks.

Keeping these safeguards tuned and validated helps maintain reliability as traffic grows.
