# DB_SCHEMA.md

Database schema reference for Zova Sport (VSport).

**DBMS:** MySQL (via Laravel migrations — SQLite in tests)

> This document is a hand-maintained reference. `database/migrations/` is the
> source of truth — if this doc and the migrations disagree, trust the
> migrations and fix this file. Run `php artisan migrate:status` to see what's
> applied, or `php artisan schema:dump` for an exact SQL snapshot.

---

## 1. Overview

Zova Sport uses a normalized OLTP schema:

- **Option-based product catalog** (style → options → option values → SKU variant) — there is **no `product_colorways` table**; it was replaced by a generic option system so any option (Color, Size, Shape, Edition, …) can drive the gallery, not just color.
- Per-SKU inventory with two-stage reservation (reserve at cart, deduct at order confirmation)
- Server-side cart (`carts` / `cart_items`), not client-only
- Order history with denormalized line-item snapshots (immune to later catalog edits)
- Laravel-native auth (`users` table, Fortify 2FA/passkeys) — **no Supabase Auth**
- A small OLAP star schema (`fact_sales`, `dim_*`) populated by a daily ETL command for admin analytics

All tables below are implemented and in production use (`database/migrations/`). None are "future" placeholders.

---

## 2. Product Hierarchy

```
products (style)
  ├── product_options (Color, Size, …; per-product, ordered)
  │     └── product_option_values (swatch hex, per-value sale price, sort order)
  │           └── product_images (gallery scoped to one option_value_id, e.g. one per color)
  ├── product_variants (SKU = combination of option values via variant_option_values)
  │     └── inventory (1:1)
  ├── product_attributes (grouped key/value spec sheet, optionally scoped to an option value)
  ├── product_content_sections (rich editorial blocks)
  │     └── product_content_section_images
  ├── nike_by_you_options (customizable component definitions, if product.is_customizable)
  └── product_sustainability_materials (Move to Zero style material breakdown)

category_option_templates → default option set applied when an admin creates a product in a category
brands, size_guides → optional product-level associations
```

### SKU

`product_variants.sku` is a plain unique string set by the admin/import (e.g. `DD1391-BLACK-US9`); it is not auto-derived from option values at the DB level.

---

## 3. Entity Relationship Diagram

```mermaid
erDiagram
    users ||--o{ carts : owns
    users ||--o{ orders : places
    users ||--o{ product_reviews : writes

    categories ||--o{ categories : parent
    categories ||--o{ products : contains
    brands ||--o{ products : brands

    products ||--o{ product_options : has
    product_options ||--o{ product_option_values : has
    product_option_values ||--o{ product_images : galleries
    products ||--o{ product_variants : has
    product_variants ||--o{ variant_option_values : composed_of
    variant_option_values }o--|| product_option_values : references
    products ||--o{ nike_by_you_options : configures
    products ||--o{ product_sustainability_materials : tracks
    products ||--o{ product_reviews : reviewed_by

    product_variants ||--|| inventory : stocks
    product_variants ||--o{ cart_items : in
    product_variants ||--o{ order_items : sold_as

    carts ||--o{ cart_items : contains
    orders ||--o{ order_items : contains
    orders }o--|| discount_codes : applies

    users {
        bigint id PK
        string name
        string email UK
        string password
        string role
    }

    products {
        bigint id PK
        string style_code UK
        string slug UK
        bigint category_id FK
        bigint brand_id FK
        decimal base_price
        boolean is_customizable
    }

    product_variants {
        bigint id PK
        bigint product_id FK
        string sku UK
        decimal additional_price
        decimal sale_price
    }

    inventory {
        bigint id PK
        bigint variant_id FK UK
        int quantity
        int reserved_quantity
    }

    orders {
        bigint id PK
        string order_number UK
        string status
        string payment_method
        decimal total_amount
    }
```

---

## 4. Tables

### 4.1 Authentication & Users

#### `users`

Laravel-native account table (Fortify). No `roles` / `user_roles` join tables — role is a single string column.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `BIGINT` | PK, auto-increment | |
| `name` | `VARCHAR(255)` | NOT NULL | |
| `email` | `VARCHAR(255)` | UNIQUE, NOT NULL | |
| `email_verified_at` | `TIMESTAMP` | NULL | |
| `password` | `VARCHAR(255)` | NOT NULL | Hashed |
| `role` | `VARCHAR(255)` | NOT NULL, DEFAULT `'customer'`, indexed | `customer` \| `admin` (`App\Enums\UserRole`) |
| `two_factor_secret` | `TEXT` | NULL | Fortify 2FA |
| `two_factor_recovery_codes` | `TEXT` | NULL | Fortify 2FA |
| `two_factor_confirmed_at` | `TIMESTAMP` | NULL | Fortify 2FA |
| `remember_token`, `created_at`, `updated_at` | — | — | Standard Laravel columns |

#### `passkeys`

WebAuthn passkeys (Laravel Fortify passkeys). `user_id` FK → `users`, unique `credential_id`, JSON `credential`.

#### `sessions`, `password_reset_tokens`, `cache`, `jobs`

Framework tables (session driver, password resets, cache store, queue jobs table for `QUEUE_CONNECTION=database`).

---

### 4.2 Catalog

#### `categories`

Self-referencing tree.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `BIGINT` | PK |
| `name` | `VARCHAR(100)` | NOT NULL |
| `slug` | `VARCHAR(150)` | UNIQUE, NOT NULL |
| `parent_id` | `BIGINT` | FK → `categories(id)`, NULL, `SET NULL` on delete |
| `image_path`, `image_alt` | `VARCHAR` | NULL |

#### `brands`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `BIGINT` | PK |
| `name` | `VARCHAR(100)` | NOT NULL |
| `slug` | `VARCHAR(150)` | UNIQUE, NOT NULL |

#### `category_option_templates`

Default option set an admin can apply when creating a product in a category (not enforced at the DB level — a UX convenience).

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `BIGINT` | PK |
| `category_id` | `BIGINT` | FK → `categories`, `CASCADE` |
| `name` | `VARCHAR(100)` | e.g. "Color", "Size" |
| `position` | `INT` | Default 0 |
| `display_type` | `VARCHAR(20)` | Default `button` (`button` \| `swatch` \| `dropdown`) |
| `is_required` | `BOOLEAN` | Default `true` |
| `drives_gallery` | `BOOLEAN` | Default `false` — if true, this option's values scope the image gallery |
| `default_values`, `metadata` | `JSON` | NULL |

#### `products`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `BIGINT` | PK | |
| `style_code` | `VARCHAR(50)` | UNIQUE, NOT NULL | |
| `name` | `VARCHAR(255)` | NOT NULL | |
| `slug` | `VARCHAR(255)` | UNIQUE, NOT NULL | |
| `description` | `TEXT` | NULL | Plain text |
| `description_html` | `LONGTEXT` | NULL | Rich text (admin editor) |
| `category_id` | `BIGINT` | FK → `categories`, `RESTRICT` | |
| `brand_id` | `BIGINT` | FK → `brands`, NULL, `SET NULL` | |
| `sub_title` | `VARCHAR(255)` | NULL | |
| `base_price` | `DECIMAL(10,2)` | NOT NULL | |
| `gender` | `VARCHAR(20)` | NOT NULL | `Men` / `Women` / `Kids` / `Unisex` |
| `warranty_info`, `care_instructions`, `return_policy` | text | NULL | |
| `average_rating` | `DECIMAL(3,2)` | Default `0.00` | Denormalized from approved `product_reviews` |
| `review_count` | `INT` | Default `0` | Denormalized |
| `is_featured` | `BOOLEAN` | Default `false`, indexed | Homepage/PLP featured flag |
| `is_customizable` | `BOOLEAN` | Default `false` | Nike By You eligible |

#### `product_options` / `product_option_values` / `variant_option_values`

The generic replacement for the old colorway model.

**`product_options`** — one row per option axis on a product (e.g. Color, Size):

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `BIGINT` | PK |
| `product_id` | `BIGINT` | FK → `products`, `CASCADE` |
| `name` | `VARCHAR(100)` | |
| `position` | `INT` | Default 0 |
| `display_type` | `VARCHAR(20)` | Default `button` |
| `is_required` | `BOOLEAN` | Default `true` |
| `drives_gallery` | `BOOLEAN` | Default `false` |
| `metadata` | `JSON` | NULL |

**`product_option_values`** — the selectable values for one option (e.g. "Black", "US 9"):

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `BIGINT` | PK |
| `option_id` | `BIGINT` | FK → `product_options`, `CASCADE` |
| `value` | `VARCHAR(150)` | |
| `slug` | `VARCHAR(150)` | UNIQUE per `option_id` |
| `swatch_hex` | `VARCHAR(7)` | NULL |
| `sort_order` | `INT` | Default 0 |
| `sale_price` | `DECIMAL(10,2)` | NULL — promo price override at this option-value level (e.g. a colorway on sale) |
| `metadata` | `JSON` | NULL |

**`variant_option_values`** — join table assigning option values to a variant (a variant's SKU = the combination of its rows here):

| Column | Type | Constraints |
|--------|------|-------------|
| `variant_id` | `BIGINT` | FK → `product_variants`, `CASCADE` |
| `option_value_id` | `BIGINT` | FK → `product_option_values`, `CASCADE` |
| — | — | UNIQUE (`variant_id`, `option_value_id`) |

#### `product_variants`

Sellable SKU.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `BIGINT` | PK | |
| `product_id` | `BIGINT` | FK → `products`, `CASCADE`, NOT NULL | |
| `sku` | `VARCHAR(100)` | UNIQUE, NOT NULL | |
| `upc` | `VARCHAR(50)` | UNIQUE, NULL | |
| `additional_price` | `DECIMAL(10,2)` | Default `0.00` | Added to `products.base_price` when no sale price applies |
| `sale_price` | `DECIMAL(10,2)` | NULL | Overrides base + additional entirely |

**Effective price** (`ProductVariant::unitPrice()`): `sale_price` if set, else the first option value's `sale_price` if set, else `base_price + additional_price`.

#### `product_images`

Gallery image scoped to one option value (e.g. all images for the "Black" color), not a colorway.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `BIGINT` | PK |
| `option_value_id` | `BIGINT` | FK → `product_option_values`, NULL, `CASCADE` |
| `image_url` | `VARCHAR(500)` | NOT NULL |
| `storage_path` | `VARCHAR(500)` | NULL — disk path for deletion/regeneration |
| `image_alt_tag` | `VARCHAR(255)` | NULL |
| `is_primary` | `BOOLEAN` | Default `false` |
| `sort_order` | `INT` | Default 0 |

#### `product_attributes`

Grouped key/value spec sheet (e.g. "Materials" group, "Upper" key).

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `BIGINT` | PK |
| `product_id` | `BIGINT` | FK → `products`, `CASCADE` |
| `group` | `VARCHAR(50)` | |
| `key` | `VARCHAR(100)` | |
| `label` | `VARCHAR(150)` | |
| `value` | `TEXT` | |
| `sort_order` | `INT` | Default 0 |
| `option_value_id` | `BIGINT` | FK → `product_option_values`, NULL, `SET NULL` — optionally scopes an attribute to one option value |

#### `product_content_sections` / `product_content_section_images`

Rich editorial blocks on the PDP (title + text/HTML + ordered images).

#### `size_guides` / `size_guide_rows`

| Table | Key columns |
|-------|-------------|
| `size_guides` | `name`, `category_id` (FK, nullable), `brand_id` (FK, nullable), `is_default`, `columns` (JSON headers), `measure_content`, `measure_image_path/alt`, `position` |
| `size_guide_rows` | `size_guide_id` FK, `values` (JSON, one value per column), `position` |

---

### 4.3 Inventory & Customization

#### `inventory`

1:1 with `product_variants`.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `BIGINT` | PK | |
| `variant_id` | `BIGINT` | UNIQUE, FK → `product_variants`, `CASCADE` | |
| `quantity` | `INT UNSIGNED` | Default `0` | Physical stock on hand |
| `reserved_quantity` | `INT UNSIGNED` | Default `0` | Held by open carts / unconfirmed orders |
| `warehouse_location` | `VARCHAR(100)` | NULL | |

**Available stock:** `quantity - reserved_quantity` (`Inventory::availableQuantity()`, floored at 0). See [BUSINESS_LOGIC.md §8](./BUSINESS_LOGIC.md#8-inventory-logic) for the reserve/deduct lifecycle.

#### `nike_by_you_options`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `BIGINT` | PK |
| `product_id` | `BIGINT` | FK → `products`, `CASCADE` |
| `component_name` | `VARCHAR(100)` | e.g. Vamp, Swoosh, Midsole |
| `allowed_materials` | `JSON` | Array of allowed materials |
| `allowed_colors` | `JSON` | Array of `{ hex, name }` |

#### `product_sustainability_materials`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `BIGINT` | PK |
| `product_id` | `BIGINT` | FK → `products`, `CASCADE` |
| `component_name` | `VARCHAR(100)` | e.g. Outsole, Upper, Laces |
| `material_type` | `VARCHAR(100)` | e.g. Recycled Polyester |
| `component_weight_g` | `INT UNSIGNED` | |
| `recycled_content_pct` | `TINYINT UNSIGNED` | 0–100 |

**Weighted recycled %:** `SUM(component_weight_g * recycled_content_pct) / SUM(component_weight_g)`

---

### 4.4 Cart & Orders

#### `carts`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `BIGINT` | PK | |
| `user_id` | `BIGINT` | FK → `users`, NULL, `CASCADE` | Set for logged-in carts |
| `session_id` | `VARCHAR(255)` | UNIQUE, NULL | Guest cart identifier (`cart_session_id` cookie) |
| `expires_at` | `TIMESTAMP` | NOT NULL, indexed | Refreshed to `now()+24h` on every touch; enforced by `carts:release-expired` |

#### `cart_items`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `BIGINT` | PK |
| `cart_id` | `BIGINT` | FK → `carts`, `CASCADE` |
| `variant_id` | `BIGINT` | FK → `product_variants`, `RESTRICT` |
| `quantity` | `INT UNSIGNED` | NOT NULL |
| `custom_configuration` | `JSON` | NULL — Nike By You selection snapshot |
| — | — | UNIQUE (`cart_id`, `variant_id`) |

#### `discount_codes`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `BIGINT` | PK |
| `code` | `VARCHAR(50)` | UNIQUE |
| `type` | `VARCHAR(20)` | `percent` \| `fixed` (`App\Enums\DiscountType`) |
| `value` | `DECIMAL(10,2)` | |
| `min_order_amount` | `DECIMAL(10,2)` | Default 0 |
| `max_uses` | `INT UNSIGNED` | NULL = unlimited |
| `used_count` | `INT UNSIGNED` | Default 0 |
| `starts_at`, `expires_at` | `TIMESTAMP` | NULL |
| `is_active` | `BOOLEAN` | Default `true` |

#### `orders`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `BIGINT` | PK | |
| `user_id` | `BIGINT` | FK → `users`, NULL, `SET NULL` | NULL for guest checkout |
| `order_number` | `VARCHAR(100)` | UNIQUE, NOT NULL | `VS-XXXXXXXX` |
| `status` | `VARCHAR(50)` | Default `pending`, indexed | `App\Enums\OrderStatus` (§6 in BUSINESS_LOGIC.md) |
| `total_amount` | `DECIMAL(10,2)` | NOT NULL | After discount |
| `discount_code_id` | `BIGINT` | FK → `discount_codes`, NULL, `SET NULL` | |
| `discount_amount` | `DECIMAL(10,2)` | Default 0 | |
| `shipping_address` | `TEXT` | NOT NULL | **JSON-encoded** `{name, phone, address, email}` snapshot — not structured columns |
| `tracking_number` | `VARCHAR(100)` | NULL | Shipment tracking code (set by admin) |
| `shipping_carrier` | `VARCHAR(30)` | NULL | `App\Enums\ShippingCarrier` |
| `payment_intent_id` | `VARCHAR(255)` | NULL | Stripe PaymentIntent id |
| `payment_method` | `VARCHAR(20)` | Default `cod` | `cod` \| `stripe` (`App\Enums\PaymentMethod`) |
| `refund_id` | `VARCHAR(255)` | NULL | Stripe Refund id, set once a cancellation refund succeeds |
| `refund_status` | `VARCHAR(255)` | NULL | `refunded` \| `failed` (`App\Enums\RefundStatus`) — NULL means no refund was ever attempted |
| `refunded_at` | `TIMESTAMP` | NULL | Set when `refund_status = refunded` |

#### `order_items`

Immutable snapshot at purchase time.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `BIGINT` | PK |
| `order_id` | `BIGINT` | FK → `orders`, `RESTRICT` |
| `variant_id` | `BIGINT` | FK → `product_variants`, `RESTRICT` |
| `product_name` | `VARCHAR(255)` | Snapshot |
| `color_name` | `VARCHAR(150)` | Snapshot (first option value) |
| `size_val` | `VARCHAR(20)` | Snapshot (second option value, or first if only one) |
| `options_snapshot` | `JSON` | Full ordered list of `{name, value}` for every option on the variant |
| `custom_configuration` | `JSON` | NULL — Nike By You snapshot |
| `quantity` | `INT UNSIGNED` | |
| `unit_price` | `DECIMAL(10,2)` | Price at checkout |

#### `return_requests`

Customer-initiated RMA workflow ([Phase 7](./phase-060760/07-returns-extended-ops.md)).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `BIGINT` | PK | |
| `order_id` | `BIGINT` | FK → `orders`, `CASCADE` | |
| `user_id` | `BIGINT` | FK → `users`, NULL, `SET NULL` | Requesting customer |
| `status` | `VARCHAR(20)` | Default `pending`, indexed | `App\Enums\ReturnRequestStatus` |
| `reason` | `TEXT` | NOT NULL | Customer-provided reason |
| `admin_notes` | `TEXT` | NULL | Required when rejecting |
| `requested_at` | `TIMESTAMP` | NOT NULL | |
| `resolved_at` | `TIMESTAMP` | NULL | Set on `rejected` / `closed` |

#### `return_request_items`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `BIGINT` | PK |
| `return_request_id` | `BIGINT` | FK → `return_requests`, `CASCADE` |
| `order_item_id` | `BIGINT` | FK → `order_items`, `CASCADE` |
| `quantity` | `INT UNSIGNED` | ≤ original `order_items.quantity` |
| `condition` | `VARCHAR(50)` | NULL — optional item condition note |

Unique (`return_request_id`, `order_item_id`).

---

### 4.5 Reviews

#### `product_reviews`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `BIGINT` | PK |
| `user_id` | `BIGINT` | FK → `users`, `CASCADE` |
| `product_id` | `BIGINT` | FK → `products`, `CASCADE` |
| `rating` | `TINYINT UNSIGNED` | 1–5 |
| `title` | `VARCHAR(150)` | NULL |
| `body` | `TEXT` | NULL |
| `is_approved` | `BOOLEAN` | Default `false` — admin must approve before it counts toward `products.average_rating`/`review_count` or appears on the PDP |
| — | — | UNIQUE (`user_id`, `product_id`) — one review per customer per product |

---

### 4.6 Blog & Marketing

| Table | Purpose |
|-------|---------|
| `blog_categories` | Name, slug, description, sort order |
| `blog_tags` | Name, slug |
| `blog_posts` | Title, slug, excerpt, body/body_html, featured image, meta title/description, `status` (draft/published), `is_featured`, `published_at`, `author_name`, `reading_time_minutes` |
| `blog_post_tag` | Pivot: `blog_post_id` ↔ `blog_tag_id` |
| `blog_post_product` | Pivot: `blog_post_id` ↔ `product_id` (shop-the-story), with `sort_order` |
| `newsletter_subscribers` | `email` (unique), `source`, `subscribed_at` |

---

### 4.7 Ops & Configuration

#### `site_settings`

Generic key/value store for store profile, homepage campaign, and other admin-editable settings.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `BIGINT` | PK |
| `key` | `VARCHAR(255)` | UNIQUE |
| `value` | `JSON` | |

#### `admin_activity_logs`

Audit trail for admin mutations (`AdminActivityService`).

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `BIGINT` | PK |
| `user_id` | `BIGINT` | FK → `users`, `CASCADE` |
| `action` | `VARCHAR(100)` | e.g. `order.status.updated` |
| `subject_type`, `subject_id` | polymorphic | NULL |
| `properties` | `JSON` | NULL — arbitrary change payload |
| `ip_address` | `VARCHAR(45)` | NULL |
| `created_at` | `TIMESTAMP` | No `updated_at` (append-only log) |

### 4.8 Customer Account

Added in [Phase 4](./phase-060760/04-customer-experience.md) — server-side wishlist and saved addresses (previously client-only / not implemented).

#### `wishlists` / `wishlist_items`

One wishlist per authenticated user (created lazily on first use); guests still use localStorage only and are merged in on login (`WishlistService::mergeSlugs`).

| Table | Key columns |
|-------|-------------|
| `wishlists` | `user_id` (FK, **unique** — one row per user) |
| `wishlist_items` | `wishlist_id` (FK, `CASCADE`), `product_id` (FK, `CASCADE`), UNIQUE (`wishlist_id`, `product_id`) |

#### `shipping_addresses`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `BIGINT` | PK |
| `user_id` | `BIGINT` | FK → `users`, `CASCADE` |
| `label` | `VARCHAR(100)` | NULL — e.g. "Home", "Office" |
| `recipient_name` | `VARCHAR(150)` | NOT NULL |
| `phone` | `VARCHAR(30)` | NOT NULL |
| `address_line` | `TEXT` | NOT NULL |
| `is_default` | `BOOLEAN` | Default `false` — enforced single-default per user in the application layer, not a DB constraint |

Soft-capped at 10 rows per user (`ShippingAddressController`, application-level check). Selecting a saved address at checkout **copies** its values into the order's JSON `shipping_address` snapshot (§4.4) — orders never FK a live address, so editing or deleting a saved address never changes historical orders.

---

## 5. OLAP / Analytics

Star schema, separate from OLTP, populated by the daily `analytics:sync` scheduled command.

| Table | Key | Notes |
|-------|-----|-------|
| `dim_date` | `date_key` (date, PK) | year, month, day, quarter |
| `dim_customers` | `id` PK, `user_id` unique | Snapshot of `email` |
| `dim_products` | `id` PK, `product_id` unique | Snapshot of `name`, `slug` |
| `fact_sales` | `id` PK, `order_item_id` unique | `customer_dim_id` FK, `product_dim_id` FK, `date_key`, `quantity`, `line_revenue` |

---

## 6. Indexes (non-exhaustive — see migrations for the authoritative list)

| Table | Columns | Purpose |
|-------|---------|---------|
| `products` | `slug` (unique), `category_id`, `is_featured` | PDP lookup, category listing, featured rail |
| `product_colorways` (n/a — removed) | — | Superseded by `product_options`/`product_option_values` |
| `product_options`, `product_option_values` | `product_id`+`position`, `option_id` | Option render order, value lookup |
| `product_variants` | `sku` (unique), `product_id` | SKU lookup, variant list per product |
| `variant_option_values` | (`variant_id`,`option_value_id`) unique, `option_value_id` | Build a variant from selected options |
| `inventory` | `variant_id` (unique) | Stock lookup |
| `carts` | `session_id` (unique), `user_id`, `expires_at` | Guest cart, user cart, expiry sweep |
| `orders` | `order_number` (unique), `user_id`, `status` | Order lookup, history, admin filter |
| `return_requests` | (`status`, `created_at`), `order_id` | Admin RMA queue |
| `product_reviews` | (`user_id`,`product_id`) unique, (`product_id`,`is_approved`) | One review per product, PDP approved list |
| `fact_sales` | (`date_key`,`product_dim_id`) | Reporting queries |

---

## 7. Referential Integrity

| Child | Parent | ON DELETE |
|-------|--------|-----------|
| `categories.parent_id` | `categories` | `SET NULL` |
| `products.category_id` | `categories` | `RESTRICT` |
| `products.brand_id` | `brands` | `SET NULL` |
| `product_options`, `product_attributes`, `nike_by_you_options`, `product_sustainability_materials`, `product_content_sections` | `products` | `CASCADE` |
| `product_option_values` | `product_options` | `CASCADE` |
| `product_images.option_value_id` | `product_option_values` | `CASCADE` |
| `product_variants.product_id` | `products` | `CASCADE` |
| `variant_option_values` | `product_variants`, `product_option_values` | `CASCADE` |
| `inventory` | `product_variants` | `CASCADE` |
| `carts.user_id` | `users` | `CASCADE` |
| `cart_items` | `carts` (`CASCADE`), `product_variants` (`RESTRICT`) | mixed |
| `orders.user_id` | `users` | `SET NULL` |
| `orders.discount_code_id` | `discount_codes` | `SET NULL` |
| `order_items` | `orders`, `product_variants` | `RESTRICT` |
| `return_requests` | `orders` | `CASCADE` |
| `return_requests.user_id` | `users` | `SET NULL` |
| `return_request_items` | `return_requests`, `order_items` | `CASCADE` |
| `product_reviews` | `users`, `products` | `CASCADE` |

---

## 8. Inventory & Cart Flow

| Stage | DB operation | Inventory change |
|-------|--------------|-------------------|
| 1. Browse product | `SELECT` products → options → variants → inventory | None |
| 2. Add to cart | `INSERT`/`UPDATE` `cart_items`; `InventoryReservationService::reserveDelta` | `reserved_quantity += qty` |
| 3. Cart expires (hourly sweep) | `carts:release-expired` deletes cart + items | `reserved_quantity -= qty` |
| 4. Checkout | `INSERT` `orders` + `order_items`; cart line items cleared | Reservation carries over unchanged |
| 5. Order confirmed (`pending → confirmed`) | `UPDATE orders.status` | `quantity -= qty`, `reserved_quantity -= qty` |
| 6. Order cancelled from `pending` | `UPDATE orders.status` | `reserved_quantity -= qty` only (never deducted) |
| 7. Order cancelled from `confirmed`/`shipping`/`delivered` | `UPDATE orders.status` | `quantity += qty` (restored) |

See [BUSINESS_LOGIC.md §6](./BUSINESS_LOGIC.md#6-order-lifecycle) for the full state machine.

---

## 9. Access Control

Schema-level access is enforced in the application layer (Laravel middleware + policies), not database RLS. See [PERMISSIONS.md](./PERMISSIONS.md) for the full map.
