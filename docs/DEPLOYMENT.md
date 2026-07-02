# Production deployment

Guide for deploying VSport to a production environment.

## Pre-deploy checklist

Run locally or on the server after configuring `.env`:

```bash
composer install --no-dev --optimize-autoloader
npm ci && npm run build
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
- Stripe configuration (if card payments are enabled)
- Mail transport (not `log` in production)
- Scheduler heartbeats (production only)

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
| `QUEUE_CONNECTION` | `database` or `redis` if using queued mail |
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

| Variable | Description |
|----------|-------------|
| `SENTRY_LARAVEL_DSN` | Sentry DSN for production errors |

## Scheduler (required)

Cart reservations expire after 24 hours. Analytics ETL runs daily. Both are registered in `bootstrap/app.php`.

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

Run `php artisan vsport:deploy-check` in production to verify heartbeats (warns if `carts:release-expired` has not run within 2 hours or `analytics:sync` within 26 hours).

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
