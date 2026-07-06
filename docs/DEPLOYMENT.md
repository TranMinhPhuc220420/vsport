# Production deployment

Guide for deploying VSport to a production environment.

## Pre-deploy runbook

1. `composer ci:check` locally (lint, format, types, Pest — same checks CI runs; see [CI/CD pipeline](#cicd-pipeline))
2. `npm run build`
3. `php artisan migrate --force`
4. `php artisan config:cache && php artisan route:cache && php artisan view:cache`
5. `php artisan vsport:deploy-check --strict`
6. Start/restart the queue worker (see [Queue worker](#queue-worker-required))
7. Confirm the scheduler cron entry is installed (see [Scheduler](#scheduler-required))

```bash
composer ci:check
npm run build
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan vsport:deploy-check --strict
```

The deploy check validates:

- `APP_KEY`, database connectivity, pending migrations
- Vite build manifest (`public/build/manifest.json`)
- Production flags (`APP_DEBUG=false` when `APP_ENV=production`)
- Queue connection (warns if `sync` in production — order emails would block requests)
- Stripe configuration (if card payments are enabled)
- Mail transport (not `log` in production)
- Scheduler heartbeats (production only)

## CI/CD pipeline

[`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) runs on every push to `main`:

- **`test` job:** copies `.env.example` to `.env` (SQLite), installs deps, builds assets, then runs `composer ci:check` (ESLint, Prettier, `tsc --noEmit`, Pint, PHPStan, and the full Pest suite). No secrets required.
- **`deploy` job:** runs only if `test` passes; builds a production bundle and uploads it via FTPS to cPanel. Requires repo secrets `FTP_HOST`, `FTP_USERNAME`, `FTP_PASSWORD`.

A red `test` job blocks deploy — that's intentional. If `main` is red because of pre-existing violations unrelated to your change, fix or triage them before merging further work; don't bypass the pipeline.

## Queue worker (required)

Order confirmation and status-update emails are queued (`ShouldQueue` on `App\Mail\OrderConfirmationMail` / `OrderStatusUpdatedMail`). With `QUEUE_CONNECTION=database` (the default — the `jobs` table migration is included), run a worker:

```bash
php artisan queue:work --tries=3
```

Use a process supervisor (systemd, Supervisor, etc.) to keep it running and restart on deploy (`php artisan queue:restart` picks up new code after a deploy without killing in-flight jobs first).

## Environment variables

Copy `.env.example` to `.env` and set at minimum:

| Variable | Production notes |
|----------|------------------|
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `APP_URL` | Public HTTPS URL (used for Stripe webhooks and canonical links) |
| `DB_*` | MySQL connection |
| `SESSION_DRIVER` | `database` (default) or `redis` |
| `CACHE_STORE` | `database` or `redis` |
| `QUEUE_CONNECTION` | `database` (default) or `redis`. **Required**: order emails are queued — see [Queue worker](#queue-worker-required). `vsport:deploy-check` warns if this is `sync` in production. |
| `MAIL_*` | Real SMTP/API — not `log` |
| `ADMIN_*` | Seed credentials for first admin (`php artisan db:seed --class=AdminUserSeeder`) |

### Stripe (optional — COD remains available without Stripe)

| Variable | Description |
|----------|-------------|
| `STRIPE_KEY` | Publishable key (`pk_live_...`) |
| `STRIPE_SECRET` | Secret key (`sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | Signing secret from Stripe Dashboard |

**Webhook endpoint:** `{APP_URL}/stripe/webhook`

In Stripe Dashboard → Developers → Webhooks, subscribe to:

- `payment_intent.succeeded`

Use the signing secret as `STRIPE_WEBHOOK_SECRET`.

### Supabase Storage (recommended for product images)

| Variable | Description |
|----------|-------------|
| `SUPABASE_STORAGE_KEY` | S3-compatible access key |
| `SUPABASE_STORAGE_SECRET` | S3-compatible secret |
| `SUPABASE_STORAGE_BUCKET` | Bucket name |
| `SUPABASE_STORAGE_URL` | Public base URL |
| `SUPABASE_STORAGE_ENDPOINT` | S3 endpoint |

Without Supabase, images are stored on the `public` disk (`storage/app/public`).

### Error monitoring (optional)

Install `sentry/sentry-laravel` (already in `composer.json`). When `SENTRY_LARAVEL_DSN` is empty, reporting is disabled — safe for local and CI.

| Variable | Description |
|----------|-------------|
| `SENTRY_LARAVEL_DSN` | Sentry DSN for production/staging errors |
| `SENTRY_TRACES_SAMPLE_RATE` | Performance trace sample rate (default `0.1`) |
| `SENTRY_SEND_DEFAULT_PII` | Keep `false`; checkout fields are scrubbed in `App\Support\SentryEventScrubber` |

**Setup:**

1. Create a Sentry project (PHP / Laravel).
2. Set `SENTRY_LARAVEL_DSN` in production `.env`.
3. Deploy and trigger a test exception, or run `php artisan sentry:test` if published.
4. Confirm events appear without raw email/phone in request bodies.

**Tests:** `tests/Feature/Ops/SentryConfigurationTest.php` asserts DSN-empty default and scrubber behavior.

### E2E smoke tests (optional locally, CI on `main`)

Playwright specs live in `e2e/`. See [e2e/README.md](../e2e/README.md).

```bash
php artisan migrate:fresh --seed --seeder=E2eSeeder --force
npm run build
npm run e2e
```

CI runs the `e2e` job in `.github/workflows/deploy.yml` after Pest + static analysis pass.

## Scheduler (required)

Cart reservations expire after 24 hours. Analytics ETL runs daily. The low-stock alert email runs daily at 08:00. All three are registered in `bootstrap/app.php`.

Add a cron entry on the server (single instance):

```cron
* * * * * cd /path/to/vsport-3 && php artisan schedule:run >> /dev/null 2>&1
```

### Scheduler monitoring

Each scheduled command writes a heartbeat to cache and structured logs:

| Command | Schedule | Cache key | Log event |
|---------|----------|-----------|-----------|
| `carts:release-expired` | Hourly | `ops.scheduler.carts-release-expired` | `scheduler.carts.release-expired` |
| `analytics:sync` | Daily | `ops.scheduler.analytics-sync` | `scheduler.analytics.sync` |
| `inventory:check-low-stock` | Daily at 08:00 | `ops.scheduler.inventory-low-stock-check` | `scheduler.inventory.check-low-stock` |

Run `php artisan vsport:deploy-check` in production to verify heartbeats (warns if `carts:release-expired` has not run within 2 hours, or `analytics:sync`/`inventory:check-low-stock` within 26 hours).

Failed schedule runs log `scheduler.*.failed` via Laravel's `onFailure` hooks.

## Web server

Point the document root to `public/`. Ensure:

- `storage/` and `bootstrap/cache/` are writable
- HTTPS is terminated at the load balancer or web server
- `client_max_body_size` (nginx) allows product/homepage image uploads (≥ 6 MB)

## Post-deploy smoke test

1. **Storefront:** `/`, PLP, PDP, add to bag, checkout (COD)
2. **Auth:** register, login, `/dashboard` account hub, order history
3. **Admin:** `/admin` — confirm order, update product inventory
4. **Stripe (if enabled):** test card checkout + webhook delivery in Stripe Dashboard
5. **Scheduler:** wait for hourly cron or run manually:
   ```bash
   php artisan carts:release-expired
   php artisan analytics:sync
   php artisan inventory:check-low-stock
   php artisan vsport:deploy-check
   ```

## Rollback

```bash
git checkout <previous-tag>
composer install --no-dev --optimize-autoloader
npm ci && npm run build
php artisan migrate --force
php artisan config:cache
php artisan route:cache
```

If a migration is irreversible, restore a database backup instead of rolling back migrations.

## Health check

Laravel exposes `GET /up` for load balancer health checks (configured in `bootstrap/app.php`).
