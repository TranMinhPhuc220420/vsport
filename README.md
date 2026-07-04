# Zova Sport

Sports e-commerce platform inspired by Nike-style shopping — photography-first UI, fast checkout, COD and Stripe payments.

## Overview

Zova Sport is an e-commerce application focused on:

- **COD + Stripe checkout** — cash on delivery by default; card payments when Stripe is configured
- **Minimal checkout** — few steps, low friction for customers
- **Multi-tier catalog** — style → colorway → SKU (size), supporting Nike-style product pages
- **Admin-controlled orders** — lifecycle: `pending → confirmed → shipping → delivered → completed` (or `cancelled`)
- **Server-side cart** — inventory reservation with hourly expiry via scheduler

### User roles

| Role | Key permissions |
|------|-----------------|
| **Guest** | View product listings and details |
| **User** | Place orders, view own orders |
| **Admin** | Manage products, orders, and users |

## Tech stack

| Layer | Technology |
|-------|------------|
| Backend | Laravel 13, Fortify (auth), Inertia |
| Frontend | React 19, TypeScript, Tailwind CSS, Radix UI |
| Database | MySQL |
| Storage | Supabase Storage (product images) |
| Build | Vite, Wayfinder |

## Project documentation

| File | Contents |
|------|----------|
| [docs/BUSINESS_LOGIC.md](docs/BUSINESS_LOGIC.md) | Business flows: cart, COD checkout, inventory, order lifecycle |
| [docs/DB_SCHEMA.md](docs/DB_SCHEMA.md) | MySQL schema: products, colorways, variants, orders |
| [docs/DESIGN.md](docs/DESIGN.md) | Storefront design system: Nike-style colors, typography, components |
| [docs/DESIGN_ADMIN.md](docs/DESIGN_ADMIN.md) | Admin panel design system: neutral dashboard, forms, tables |
| [docs/PERMISSIONS.md](docs/PERMISSIONS.md) | Guest / User / Admin permissions, RLS |
| [docs/CODING_RULES.md](docs/CODING_RULES.md) | Code conventions, validation, security |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Production deploy, Stripe webhooks, scheduler, ops checks |

## Setup

```bash
# Clone & install dependencies
composer install
cp .env.example .env
php artisan key:generate

# Configure DB in .env (MySQL)
php artisan migrate

# Frontend
npm install
npm run dev

# Run app (separate terminal)
php artisan serve
```

Or use bundled scripts:

```bash
composer setup   # install + migrate + npm install + build
composer dev     # serve + queue + vite concurrently
```

### Production readiness

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the full checklist. Quick validation:

```bash
npm run build
php artisan migrate --force
php artisan vsport:deploy-check --strict
```

Configure Stripe webhook: `{APP_URL}/stripe/webhook` with event `payment_intent.succeeded`.

Ensure cron runs `php artisan schedule:run` every minute for `carts:release-expired` and `analytics:sync`.

## Project structure

```
app/                    # Controllers, Models, Services
database/migrations/    # Schema migrations
resources/js/
  pages/                # Inertia pages (React)
  components/           # UI components
docs/                   # Design & business documentation
```

---

## Development roadmap

> Update the checklist by changing `- [ ]` → `- [x]` when a task is completed.

### Phase 0 — Project foundation

Application scaffold and user authentication.

- [x] Laravel + Inertia + React + TypeScript setup
- [x] Auth: register, login, forgot password, email verification
- [x] 2FA and Passkeys (Fortify)
- [x] Settings pages: profile, security, appearance
- [x] Add `admin` / `customer` roles to `users` (or `roles` table)
- [x] Middleware to protect admin routes
- [x] Seed default admin user

### Phase 1 — Design system & layout

Apply the Nike-style design system from `docs/DESIGN.md` (storefront only). Admin UI uses `docs/DESIGN_ADMIN.md`.

- [x] Design tokens: colors (`ink`, `soft-cloud`, `sale`, etc.), 8px spacing, border-radius
- [x] Typography: Inter / Bebas Neue as Nike font substitutes
- [x] Core components: `Button`, `Badge`, `ProductCard`, `FilterChip`, `SearchPill`
- [x] Storefront layout: `UtilityBar`, `PrimaryNav`, `Footer`
- [x] Responsive layout: mobile drawer, PLP/PDP breakpoints
- [x] Admin layout (dedicated sidebar or top-nav)

### Phase 2 — Database & catalog backend

Migrations and APIs for the product catalog per `docs/DB_SCHEMA.md`.

- [x] Migration: `categories`, `products`, `product_colorways`, `product_images`
- [x] Migration: `product_variants`, `inventory`
- [x] Migration: `orders`, `order_items`
- [x] Eloquent models + relationships
- [x] Sample seed data (categories, products, colorways, variants)
- [x] Supabase Storage integration for product image uploads
- [x] API/Controller: product listing (category filter, pagination)
- [x] API/Controller: product detail (colorway, size, stock)

### Phase 3 — Storefront (customer)

Public pages for Guest and User.

- [x] Home page: campaign hero, featured products, category tiles
- [x] PLP (Product Listing Page): grid, filter sidebar, sort, pagination
- [x] PDP (Product Detail Page): gallery, colorway picker, size picker, add to cart
- [x] Stock status display (in stock / out of stock)
- [x] Pricing: base price, discount price, sale styling (`#d30005`)

### Phase 4 — Cart & COD checkout

Purchase flow per `docs/BUSINESS_LOGIC.md`.

- [x] Client-side cart (localStorage) — MVP, no DB persistence
- [x] Cart page: view, update quantity, remove items
- [x] Merge cart after login (optional)
- [x] Checkout page: name, phone, address form
- [x] Validate stock before creating order
- [x] Create order with `status = pending` + `order_items` snapshot
- [x] Deduct stock on order creation (or on admin confirm — finalize per business rule)
- [x] Order confirmation page
- [x] Order history page (logged-in User)

### Phase 5 — Admin panel

Product and order management.

- [x] Admin dashboard: new orders overview, basic revenue
- [x] CRUD categories
- [x] CRUD products (style + colorways + variants + images)
- [x] Inventory management (update quantities)
- [x] Order list (filter by status)
- [x] Order detail view
- [x] Update order status: `confirmed → shipping → delivered → completed`
- [x] Cancel order (`cancelled`) + restore stock if needed
- [x] User list + role management

### Phase 6 — Polish & quality

- [x] Server-side validation for all forms (per `docs/CODING_RULES.md`)
- [x] Structured error responses, no raw DB errors exposed
- [x] Feature tests: auth, checkout, admin order flow
- [x] Permission checks per `docs/PERMISSIONS.md`
- [x] Performance: pagination, lazy-load images, category cache
- [x] SEO: product slugs, meta tags, image alt text

### Phase 7 — Post-MVP extensions

Per `docs/BUSINESS_LOGIC.md` and `docs/DB_SCHEMA.md`.

- [x] Online payment (Stripe / `payment_intent_id`)
- [x] Server-side cart (`carts`, `cart_items`, reservation)
- [x] Discount codes
- [x] Reviews & ratings
- [x] Nike By You customization
- [x] Sustainability materials
- [x] OLAP / analytics (`fact_sales`, `dim_*`)

See `docs/phase/post-mvp/01-extensions.md`.

---

## Current status

**At:** Release-ready — Phase 7 complete with storefront polish (Sprint 1–2) and production ops tooling (Sprint 3).

**Features:** Server cart with reservation, discount codes, COD + Stripe checkout, reviews, sustainability PDP, Nike By You, analytics ETL, admin panel, i18n (en/vi).

**Ops:** `php artisan vsport:deploy-check` validates env, DB, build assets, Stripe, and scheduler heartbeats. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
