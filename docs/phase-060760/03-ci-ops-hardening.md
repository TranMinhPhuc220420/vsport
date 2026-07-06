# Phase 3 — CI/CD & Ops Hardening

Strengthen the delivery pipeline and production runtime so releases are validated consistently and transactional email does not block HTTP requests.

**Priority:** P0  
**Estimated effort:** 2–3 days  
**Status:** Done

---

## Goal

Every push to `main` runs the same checks a developer runs locally (`composer ci:check`). Production sends order emails asynchronously via the queue. Deploy checklist is executable and documented.

---

## Prerequisites

- [x] None (can run in parallel with Phases 1–2)

---

## Scope checklist

### 3.1 GitHub Actions — full CI check

- [x] Update [`.github/workflows/deploy.yml`](../../.github/workflows/deploy.yml) `test` job to run `composer ci:check` instead of only `php artisan test`
- [x] Ensure job has enough time / resources for `npm run types:check` and PHPStan
- [x] Keep SQLite for test DB (existing `.env.example` copy flow)
- [x] Deploy job still runs `composer install --no-dev` + `npm run build` (unchanged)
- [x] Document required secrets in workflow comment or DEPLOYMENT.md

### 3.2 Queued mail

- [x] Implement `ShouldQueue` on [`OrderConfirmationMail`](../../app/Mail/OrderConfirmationMail.php)
- [x] Implement `ShouldQueue` on [`OrderStatusUpdatedMail`](../../app/Mail/OrderStatusUpdatedMail.php)
- [x] Use `database` or `redis` queue driver in production `.env.example` comments
- [x] Verify [`OrderNotificationService`](../../app/Services/Order/OrderNotificationService.php) still dispatches correctly (no behavior change except async)
- [x] Add feature test: assert mail is queued ( `Mail::fake()` + `assertQueued` ) for COD checkout and status update
- [x] Document queue worker in [DEPLOYMENT.md](../DEPLOYMENT.md):
  ```bash
  php artisan queue:work --tries=3
  ```
  Or supervisor config example

### 3.3 Deploy check enhancements (optional but recommended)

- [x] Review [`vsport:deploy-check`](../../app/Console/Commands/) — add warning if `QUEUE_CONNECTION=sync` in production
- [x] Add warning if `MAIL_MAILER=log` in production (may already exist — verify)
- [x] Test: [`DeployCheckTest.php`](../../tests/Feature/Ops/DeployCheckTest.php) updated if new checks added

### 3.4 Scheduler validation

- [x] Confirm `bootstrap/app.php` registers:
  - `carts:release-expired` (hourly)
  - `analytics:sync` (daily)
- [x] Document cron entry in DEPLOYMENT.md (verify not duplicated / stale)
- [x] Smoke: `php artisan schedule:list` shows both commands

### 3.5 Production environment template

- [x] Update [`.env.example`](../../.env.example) with commented production blocks:
  - `QUEUE_CONNECTION=database`
  - `MAIL_*` SMTP example
  - `SENTRY_LARAVEL_DSN` (optional, full setup in Phase 6)
- [x] Add `jobs` table migration note if using database queue (Laravel default migration exists)

### 3.6 Pre-deploy runbook

- [x] Add "Phase 3 deploy runbook" section to DEPLOYMENT.md or this file:
  1. `composer ci:check` locally
  2. `npm run build`
  3. `php artisan migrate --force`
  4. `php artisan vsport:deploy-check --strict`
  5. Start/restart queue worker
  6. Verify cron for scheduler

---

## Key files

| Layer | Path |
|-------|------|
| CI | `.github/workflows/deploy.yml` |
| Mail | `app/Mail/Order*.php` |
| Service | `app/Services/Order/OrderNotificationService.php` |
| Deploy | `app/Console/Commands/*DeployCheck*` |
| Docs | `docs/DEPLOYMENT.md`, `.env.example` |
| Tests | `tests/Feature/Ops/`, `tests/Feature/Checkout/CreateOrderTest.php` |

---

## Acceptance criteria

1. CI fails on TypeScript errors, ESLint violations, PHPStan issues, or test failures.
2. Order confirmation email is queued, not sent inline during checkout request.
3. `php artisan vsport:deploy-check --strict` passes on a correctly configured production-like `.env`.
4. DEPLOYMENT.md documents queue worker as **required** for email delivery.

---

## Verification

```bash
composer ci:check
php artisan test --filter=DeployCheck
php artisan test --filter=CreateOrder
php artisan schedule:list
```

Manual (local):

- [x] Set `QUEUE_CONNECTION=database`, run `php artisan queue:work`, place COD order, confirm job processed and email sent/logged

---

## Out of scope

- Sentry integration (Phase 6)
- Kubernetes / Docker production setup
- Blue-green deployments

---

## Progress log

| Date | Task | Notes |
|------|------|-------|
| 2026-07-06 | 3.4 | **Found and fixed a real production bug** while smoke-testing: `bootstrap/app.php` imported `Illuminate\Support\Facades\Schedule` (the facade) instead of `Illuminate\Console\Scheduling\Schedule` as the `withSchedule()` closure's type hint. This made `php artisan schedule:run` / `schedule:list` fatal-error on every invocation — meaning `carts:release-expired` and `analytics:sync` never actually ran via cron in any environment before this fix. Fixed the import; `schedule:list` now shows both commands with correct next-run times. |
| 2026-07-06 | 3.1–3.6 | CI now runs `composer ci:check` (user confirmed OK to ship red until the ~80 pre-existing lint/type violations are cleaned up separately — not in phase-060760 scope). Queued `OrderConfirmationMail`/`OrderStatusUpdatedMail` (`ShouldQueue`); fixed two pre-existing tests that asserted `assertSent` instead of `assertQueued`. Added `QUEUE_CONNECTION=sync` production warning to `vsport:deploy-check`. Updated `.env.example` (queue/jobs note, SMTP example block). Added CI/CD pipeline + Queue worker sections to DEPLOYMENT.md and restructured the pre-deploy steps into a runbook. **End-to-end verified locally**: migrated a fresh DB (confirms DB_SCHEMA.md table list matches `migrate:status` exactly), placed a real COD order, confirmed a job landed in `jobs`, ran `queue:work --once`, and confirmed the rendered confirmation email in `storage/logs/laravel.log`. |
