# E2E smoke tests (Playwright)

Browser-level smoke tests for critical revenue paths. Feature coverage lives in Pest (`tests/Feature`).

## Prerequisites

```bash
composer install
npm ci
npm run build
npx playwright install chromium
```

Seed deterministic catalog + users:

```bash
php artisan migrate:fresh --seed --seeder=E2eSeeder --force
```

`E2eSeeder` creates:

| User | Email | Password | Role |
|------|-------|----------|------|
| Admin | `admin@vsport.local` (from `.env`) | `password` | admin |
| Customer | `customer@e2e.test` | `password` | customer |

Catalog includes in-stock product `zegama-2` (Hoka trail shoe).

## Run locally

`playwright.config.ts` starts `php artisan serve` automatically when not in CI.

```bash
npm run e2e
```

With an existing server:

```bash
E2E_BASE_URL=http://127.0.0.1:8000 npm run e2e
```

## CI

GitHub Actions job `e2e` in `.github/workflows/deploy.yml`:

1. SQLite file database
2. `migrate:fresh --seeder=E2eSeeder`
3. `php artisan serve` in background
4. `npm run e2e:ci`

## Scenarios

| ID | Spec | Flow |
|----|------|------|
| E2E-1 | `browse-pdp-cart.spec.ts` | Guest PLP → PDP → add to bag → cart |
| E2E-2 | `checkout-cod.spec.ts` | Customer login → checkout COD → confirmation |
| E2E-3 | `admin-order.spec.ts` | Admin login → confirm pending order |

Stable selectors: `data-testid` on add-to-bag, checkout-submit, login-submit, admin-order-confirm.
