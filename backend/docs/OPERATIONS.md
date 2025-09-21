# Backend Operational Safeguards

## Overview

The backend enables structured logging, in-memory rate limiting, and asynchronous email dispatch to harden production operations. This guide explains the behavior, configuration knobs, and validation tips for each safeguard.

## Structured Logging

- Logging is configured at application start by pp.core.logging_config.configure_logging.
- Set LOG_LEVEL (default INFO) and LOG_JSON (default True) in .env to control verbosity and formatting.
- When LOG_JSON=True, each log line is emitted as JSON with 	imestamp, level, logger, and message fields so collectors such as Loki, Datadog, or ELK can index them easily.
- Switch back to human readable output by setting LOG_JSON=False.

### Verification

Run docker compose logs backend --tail 10 and confirm that log entries render as single line JSON objects during API traffic.

## Rate Limiting

- pp.core.rate_limiter.RateLimiterMiddleware throttles repeated requests per client IP.
- Defaults:
  - RATE_LIMIT_ENABLED=True
  - RATE_LIMIT_MAX_REQUESTS=100
  - RATE_LIMIT_WINDOW_SECONDS=60
  - RATE_LIMIT_EXCLUDE_PATHS=['/api/v1/utils/health-check/']
- Excluded paths bypass throttling for uptime probes.
- Adjust values in .env to tighten or loosen the policy. Set RATE_LIMIT_ENABLED=False to disable the middleware entirely.

### Verification

Trigger the limit with a tight window:

`ash
# Temporarily reduce the limit for local testing
export RATE_LIMIT_MAX_REQUESTS=3
export RATE_LIMIT_WINDOW_SECONDS=30

# Issue four calls; the last should return 429 with Retry-After
for _ in 1 2 3 4; do
  docker compose exec backend curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/api/v1/items/
done
`

Reset the environment variables afterwards or restart the stack to restore defaults.

## Asynchronous Email Dispatch

- pp.utils.send_email offloads SMTP work to a background thread using AnyIO so API calls respond without blocking on external servers.
- The helper logs email_dispatched with recipient, subject, and SMTP response for traceability.
- Email sending requires the following .env values:
  - SMTP_HOST
  - SMTP_PORT
  - SMTP_USER / SMTP_PASSWORD when authentication is required
  - EMAILS_FROM_EMAIL
  - EMAILS_FROM_NAME (falls back to PROJECT_NAME)

### Verification

1. Configure SMTP credentials (use MailHog or another sandbox during development).
2. Call POST /api/v1/login/password-recovery/<email>.
3. Check backend logs for an email_dispatched entry and verify receipt via your SMTP sink.

## Operations Checklist

- [ ] Confirm structured logs appear in your observability stack with correct fields.
- [ ] Exercise the rate limiter and ensure alerts trigger when 429 responses spike.
- [ ] Send a password recovery email and verify delivery latency stays low under load.
- [ ] Document overrides for LOG_LEVEL, RATE_LIMIT_*, and SMTP credentials in deployment runbooks.

Keeping these safeguards tuned and validated helps maintain reliability as traffic grows.
