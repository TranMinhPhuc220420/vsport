# Phase 2 — Database & Catalog Backend

Catalog schema, Eloquent models, sample seed data, Supabase-compatible image storage, and public product API.

## Scope

| Item | Status |
|------|--------|
| Migration: categories, products, product_colorways, product_images | Done |
| Migration: product_variants, inventory | Done |
| Migration: orders, order_items | Done |
| Eloquent models + relationships | Done |
| Sample seed data | Done |
| Supabase Storage integration | Done |
| API: product listing (category, pagination, sort) | Done |
| API: product detail (colorways, sizes, stock) | Done |

## Schema overview

```
categories ──< products ──< product_colorways ──< product_images
                              └──< product_variants ──< inventory

users ──< orders ──< order_items >── product_variants
```

Orders schema is ready for Phase 4 checkout. Carts are not included (client-side cart MVP).

## Inventory rule

Stock is **deducted when admin confirms an order** (`pending → confirmed`), not at order creation.

```
available_stock = inventory.quantity - inventory.reserved_quantity
```

Phase 4 checkout validates `available_stock` before creating a `pending` order.

## API

Base path: `/api`

### List products

`GET /api/products`

| Query | Description |
|-------|-------------|
| `category` | Category slug (includes direct children, e.g. `men` includes `men-shoes`) |
| `gender` | `Men`, `Women`, `Kids`, `Unisex` |
| `sort` | `newest`, `price_asc`, `price_desc` |
| `page` | Page number |
| `per_page` | Items per page (max 48, default 12) |

Example response (truncated):

```json
{
  "data": [
    {
      "id": 1,
      "name": "Zegama 2",
      "slug": "zegama-2",
      "subTitle": "Men's Trail Running Shoes",
      "gender": "Men",
      "basePrice": 180,
      "minPrice": 135,
      "maxPrice": 180,
      "inStock": true,
      "primaryImage": { "url": "...", "alt": "..." }
    }
  ],
  "links": { "...": "..." },
  "meta": { "current_page": 1, "...": "..." }
}
```

### Product detail

`GET /api/products/{slug}`

Returns product with `colorways[]`, each with `images[]` and `variants[]` including `stock.available` and `stock.inStock`.

404: `{ "message": "Product not found" }`

## Admin image upload

`POST /admin/colorways/{colorway}/images` (auth + admin)

Multipart form:

- `image` (required) — jpeg, png, webp, max 5MB
- `image_alt_tag` (optional)
- `is_primary` (optional boolean)
- `sort_order` (optional)

Returns `201` with `{ "image": { ... } }`.

## Supabase Storage

Configure in `.env`:

```
SUPABASE_STORAGE_KEY=
SUPABASE_STORAGE_SECRET=
SUPABASE_STORAGE_REGION=us-east-1
SUPABASE_STORAGE_BUCKET=product-images
SUPABASE_STORAGE_URL=
SUPABASE_STORAGE_ENDPOINT=
```

When Supabase env vars are empty, uploads fall back to the `public` disk (local dev).

**Never expose the service role key to the client.**

## Seed data

```bash
php artisan db:seed --class=CatalogSeeder
```

Sample products: Zegama 2, Air Max Pulse, Jordan 1 Low, Revolution 7, Air Force 1.

## Key files

| Layer | Path |
|-------|------|
| Migrations | `database/migrations/2026_07_01_*` |
| Models | `app/Models/{Category,Product,...}.php` |
| Service | `app/Services/Catalog/ProductCatalogService.php` |
| Image storage | `app/Services/ProductImageStorage.php` |
| API | `app/Http/Controllers/Api/ProductController.php` |
| Resources | `app/Http/Resources/Product*Resource.php` |
| Seeder | `database/seeders/CatalogSeeder.php` |

## Verification

```bash
php artisan migrate
php artisan db:seed --class=CatalogSeeder
php artisan test --filter=Catalog
php artisan test --filter=ProductImage
```
