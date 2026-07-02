# DB_SCHEMA.md

Database schema reference for VSport

**DBMS:** MySQL

---

## 1. Overview

VSport uses a normalized OLTP schema optimized for:

- Multi-tier product catalog (style → colorway → SKU variant)
- Per-SKU inventory with reservation
- Order history with denormalized line-item snapshots
- Role-based access control

The design separates **static product data**, **sellable variants (SKU)**, and **transactional data** (cart, orders) to support Nike-style product pages where changing colorway updates images, price, and availability without reloading the entire product.

### 1.1 MVP vs Full Schema

| Area | MVP (current) | Full schema (this document) |
|------|---------------|-----------------------------|
| Cart | Client-side (localStorage) | `carts`, `cart_items` tables |
| Payment | COD only | `payment_intent_id` reserved for future Stripe integration |
| Customization | Not implemented | `nike_by_you_options` |
| Sustainability | Not implemented | `product_sustainability_materials` |
| OLAP / analytics | Not implemented | Star schema (`fact_sales`, `dim_*`) |
| Auth | Supabase Auth (`auth.users`) | `users` mirrors profile + credentials |

Implement tables incrementally. Tables marked **(future)** can be deferred.

---

## 2. Product Hierarchy

Three-layer model to handle SKU proliferation:

```
products (style)
  └── product_colorways (colorway)
        ├── product_images
        ├── nike_by_you_options          (future)
        ├── product_sustainability_materials (future)
        └── product_variants (SKU = style + color + size)
              └── inventory (1:1)
```

### SKU Format

Nike-style SKU: `{style_code}-{colorway_code}-{size}`

Example: `DD1391-100-US9` → Nike Dunk Low, Panda White/Black, US 9

| Layer | Table | Example |
|-------|-------|---------|
| Style | `products` | `DD1391` — Nike Dunk Low |
| Colorway | `product_colorways` | `DD1391-100` — White/Black |
| Variant (SKU) | `product_variants` | `DD1391-100-US9` |

---

## 3. Entity Relationship Diagram

```mermaid
erDiagram
    users ||--o{ user_roles : has
    roles ||--o{ user_roles : assigned
    users ||--o{ carts : owns
    users ||--o{ orders : places

    categories ||--o{ categories : parent
    categories ||--o{ products : contains

    products ||--o{ product_colorways : has
    product_colorways ||--o{ product_images : has
    product_colorways ||--o{ product_variants : has
    product_colorways ||--o{ nike_by_you_options : configures
    product_colorways ||--o{ product_sustainability_materials : tracks

    product_variants ||--|| inventory : stocks
    product_variants ||--o{ cart_items : in
    product_variants ||--o{ order_items : sold_as

    carts ||--o{ cart_items : contains
    orders ||--o{ order_items : contains

    users {
        bigint id PK
        varchar email UK
        varchar password_hash
        boolean is_active
    }

    products {
        bigint id PK
        varchar style_code UK
        varchar slug UK
        bigint category_id FK
        decimal base_price
    }

    product_colorways {
        bigint id PK
        bigint product_id FK
        varchar full_style_code UK
        boolean is_customizable
    }

    product_variants {
        bigint id PK
        bigint colorway_id FK
        varchar sku UK
        varchar size_val
    }

    inventory {
        bigint id PK
        bigint variant_id FK UK
        int quantity
        int reserved_quantity
    }

    orders {
        bigint id PK
        varchar order_number UK
        varchar status
        decimal total_amount
    }
```

---

## 4. Tables

### 4.1 Authentication & Users

#### `users`

Account profiles for customers and staff. With Supabase Auth, `id` should match `auth.users.id` (UUID in Supabase) or sync via trigger. The spec below uses `BIGSERIAL` as in the design doc; adapt ID type when integrating Supabase Auth.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `BIGINT` | PK, auto-increment | Primary key |
| `email` | `VARCHAR(255)` | UNIQUE, NOT NULL | Login email |
| `password_hash` | `VARCHAR(255)` | NOT NULL | Hashed password (omit if using Supabase Auth only) |
| `first_name` | `VARCHAR(100)` | NULL | First name |
| `last_name` | `VARCHAR(100)` | NULL | Last name |
| `phone` | `VARCHAR(20)` | NULL | Contact phone |
| `is_active` | `BOOLEAN` | DEFAULT `TRUE` | Account active flag |
| `created_at` | `TIMESTAMP` | DEFAULT `NOW()` | Account creation time |

#### `roles`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `INT` | PK, auto-increment | Role ID |
| `role_name` | `VARCHAR(50)` | UNIQUE, NOT NULL | e.g. `admin`, `customer`, `staff` |

**VSport roles:** `guest` (no row), `customer`, `admin` — see [PERMISSIONS.md](./PERMISSIONS.md).

#### `user_roles`

Many-to-many link between users and roles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `user_id` | `BIGINT` | FK → `users(id)` | User reference |
| `role_id` | `INT` | FK → `roles(id)` | Role reference |
| — | — | PK (`user_id`, `role_id`) | Composite primary key |

---

### 4.2 Catalog & Products

#### `categories`

Self-referencing tree for hierarchical navigation (e.g. Shoes → Running → Jordan).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `BIGINT` | PK, auto-increment | Category ID |
| `name` | `VARCHAR(100)` | NOT NULL | Display name |
| `slug` | `VARCHAR(150)` | UNIQUE, NOT NULL | URL slug (SEO) |
| `parent_id` | `BIGINT` | FK → `categories(id)`, NULL | Parent category |

#### `products`

Static product-line data shared across all colorways.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `BIGINT` | PK, auto-increment | Product ID |
| `style_code` | `VARCHAR(50)` | UNIQUE, NOT NULL | Style code (e.g. `DD1391`) |
| `name` | `VARCHAR(255)` | NOT NULL | Product name |
| `slug` | `VARCHAR(255)` | UNIQUE, NOT NULL | URL slug |
| `description` | `TEXT` | NULL | Full description |
| `category_id` | `BIGINT` | FK → `categories(id)` | Primary category |
| `sub_title` | `VARCHAR(255)` | NULL | Short subtitle |
| `base_price` | `DECIMAL(10,2)` | NOT NULL | MSRP |
| `gender` | `VARCHAR(20)` | NOT NULL | `Men`, `Women`, `Kids`, `Unisex` |
| `warranty_info` | `VARCHAR(255)` | NULL | Warranty text |
| `care_instructions` | `TEXT` | NULL | Care / wash instructions |
| `return_policy` | `TEXT` | NULL | Return policy |
| `average_rating` | `DECIMAL(3,2)` | DEFAULT `0.00` | Denormalized avg rating |
| `review_count` | `INT` | DEFAULT `0` | Denormalized review count |
| `created_at` | `TIMESTAMP` | DEFAULT `NOW()` | Created at |

#### `product_colorways`

Colorway-level variant: images, promo price, customization flag.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `BIGINT` | PK, auto-increment | Colorway ID |
| `product_id` | `BIGINT` | FK → `products(id)` | Parent product |
| `colorway_code` | `VARCHAR(10)` | NOT NULL | 3-digit color code (e.g. `100`) |
| `full_style_code` | `VARCHAR(50)` | UNIQUE, NOT NULL | `{style_code}-{colorway_code}` |
| `color_name` | `VARCHAR(150)` | NOT NULL | Commercial color name |
| `discount_price` | `DECIMAL(10,2)` | NULL | Promo price (overrides base if set) |
| `is_customizable` | `BOOLEAN` | DEFAULT `FALSE` | Nike By You eligible |
| `is_active` | `BOOLEAN` | DEFAULT `TRUE` | Visible for sale |

**Effective price:** `COALESCE(discount_price, products.base_price) + product_variants.additional_price`

#### `product_images`

Image gallery per colorway (not per product root).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `BIGINT` | PK, auto-increment | Image ID |
| `colorway_id` | `BIGINT` | FK → `product_colorways(id)` | Parent colorway |
| `image_url` | `VARCHAR(500)` | NOT NULL | CDN / Supabase Storage URL |
| `image_alt_tag` | `VARCHAR(255)` | NULL | Alt text (SEO, a11y) |
| `is_primary` | `BOOLEAN` | DEFAULT `FALSE` | Hero image |
| `sort_order` | `INT` | DEFAULT `0` | Gallery sort order |

#### `product_variants`

Sellable SKU — one row per colorway + size combination.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `BIGINT` | PK, auto-increment | Variant ID |
| `colorway_id` | `BIGINT` | FK → `product_colorways(id)` | Parent colorway |
| `size_val` | `VARCHAR(20)` | NOT NULL | Size label (e.g. `US 9`) |
| `sku` | `VARCHAR(100)` | UNIQUE, NOT NULL | Full SKU |
| `upc` | `VARCHAR(50)` | UNIQUE, NULL | Barcode |
| `additional_price` | `DECIMAL(10,2)` | DEFAULT `0.00` | Size surcharge |

**Unique constraint (recommended):** `UNIQUE (colorway_id, size_val)`

---

### 4.3 Inventory & Customization

#### `inventory`

One-to-one with `product_variants`. Tracks physical stock and cart reservations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `BIGINT` | PK, auto-increment | Inventory ID |
| `variant_id` | `BIGINT` | UNIQUE, FK → `product_variants(id)` | Linked SKU |
| `quantity` | `INT` | NOT NULL, DEFAULT `0`, `>= 0` | Physical stock on hand |
| `reserved_quantity` | `INT` | DEFAULT `0`, `>= 0` | Temporarily held (cart/checkout) |
| `warehouse_location` | `VARCHAR(100)` | NULL | Bin / shelf location |

**Available stock:** `quantity - reserved_quantity`

#### `nike_by_you_options` *(future)*

Customizable component definitions per colorway.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `BIGINT` | PK, auto-increment | Option ID |
| `colorway_id` | `BIGINT` | FK → `product_colorways(id)` | Customizable colorway |
| `component_name` | `VARCHAR(100)` | NOT NULL | e.g. Vamp, Swoosh, Midsole |
| `allowed_materials` | `JSONB` | NOT NULL | Array of allowed materials |
| `allowed_colors` | `JSONB` | NOT NULL | Array of `{ hex, name }` |

---

### 4.4 Cart & Orders

#### `carts` *(future — MVP uses client-side cart)*

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `BIGINT` | PK, auto-increment | Cart ID |
| `user_id` | `BIGINT` | FK → `users(id)`, NULL | Logged-in user |
| `session_id` | `VARCHAR(255)` | UNIQUE, NULL | Guest session identifier |
| `created_at` | `TIMESTAMP` | DEFAULT `NOW()` | Created at |
| `expires_at` | `TIMESTAMP` | NOT NULL | Expiry for reservation release |

#### `cart_items` *(future)*

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `BIGINT` | PK, auto-increment | Line item ID |
| `cart_id` | `BIGINT` | FK → `carts(id)` | Parent cart |
| `variant_id` | `BIGINT` | FK → `product_variants(id)` | SKU reference |
| `custom_configuration` | `JSONB` | NULL | Custom design snapshot |
| `quantity` | `INT` | NOT NULL, DEFAULT `1`, `> 0` | Quantity |

#### `orders`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `BIGINT` | PK, auto-increment | Order ID |
| `user_id` | `BIGINT` | FK → `users(id)`, NULL | Customer (NULL for guest checkout if supported) |
| `order_number` | `VARCHAR(100)` | UNIQUE, NOT NULL | Human-readable order code |
| `status` | `VARCHAR(50)` | NOT NULL, DEFAULT `'pending'` | Order lifecycle status |
| `total_amount` | `DECIMAL(10,2)` | NOT NULL | Final order total |
| `shipping_address` | `TEXT` | NOT NULL | Delivery address (name, phone, address) |
| `payment_intent_id` | `VARCHAR(255)` | NULL | Stripe reference *(future)* |
| `created_at` | `TIMESTAMP` | DEFAULT `NOW()` | Order created at |

**Order status values** (per [BUSINESS_LOGIC.md](./BUSINESS_LOGIC.md)):

```
pending → confirmed → shipping → delivered → completed
                                              ↘ cancelled
```

| Status | Description |
|--------|-------------|
| `pending` | Created, awaiting admin confirmation (COD) |
| `confirmed` | Accepted by admin |
| `shipping` | Out for delivery |
| `delivered` | Received by customer |
| `completed` | Closed |
| `cancelled` | Cancelled |

#### `order_items`

Immutable snapshot at purchase time — survives catalog changes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `BIGINT` | PK, auto-increment | Line item ID |
| `order_id` | `BIGINT` | FK → `orders(id)` | Parent order |
| `variant_id` | `BIGINT` | FK → `product_variants(id)` | SKU reference |
| `product_name` | `VARCHAR(255)` | NOT NULL | Product name snapshot |
| `color_name` | `VARCHAR(150)` | NOT NULL | Color name snapshot |
| `size_val` | `VARCHAR(20)` | NOT NULL | Size snapshot |
| `custom_configuration` | `JSONB` | NULL | Custom design snapshot |
| `quantity` | `INT` | NOT NULL, `> 0` | Quantity purchased |
| `unit_price` | `DECIMAL(10,2)` | NOT NULL | Price at checkout |

---

### 4.5 Sustainability *(future)*

#### `product_sustainability_materials`

Recycled material breakdown per colorway component (Move to Zero).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `BIGINT` | PK, auto-increment | Row ID |
| `colorway_id` | `BIGINT` | FK → `product_colorways(id)` | Colorway |
| `component_name` | `VARCHAR(100)` | NOT NULL | e.g. Outsole, Upper, Laces |
| `material_type` | `VARCHAR(100)` | NOT NULL | e.g. Recycled Polyester |
| `component_weight_g` | `DECIMAL(6,2)` | NOT NULL | Weight in grams |
| `recycled_content_pct` | `DECIMAL(5,2)` | NOT NULL, DEFAULT `0.00` | Recycled % |

**Weighted recycled % formula:**

```
SUM(component_weight_g * recycled_content_pct) / SUM(component_weight_g)
```

---

## 5. Indexes

| Index | Table | Columns | Purpose |
|-------|-------|---------|---------|
| `idx_products_slug` | `products` | `slug` | Product page lookup |
| `idx_colorways_full_style` | `product_colorways` | `full_style_code` | Style+color lookup |
| `idx_products_category` | `products` | `category_id` | Category listing |
| `idx_colorways_product` | `product_colorways` | `product_id`, `is_active` | Active colorways per product |
| `idx_images_colorway` | `product_images` | `colorway_id` | Gallery load |
| `idx_variants_colorway` | `product_variants` | `colorway_id` | Size picker |
| `idx_inventory_variant` | `inventory` | `variant_id` | Stock lookup |
| `idx_carts_session_id` | `carts` | `session_id` (partial: `WHERE session_id IS NOT NULL`) | Guest cart |
| `idx_orders_user` | `orders` | `user_id` | User order history |

---

## 6. Referential Integrity

| Child | Parent | ON DELETE |
|-------|--------|-----------|
| `user_roles` | `users`, `roles` | CASCADE |
| `categories.parent_id` | `categories` | SET NULL |
| `products.category_id` | `categories` | RESTRICT |
| `product_colorways` | `products` | CASCADE |
| `product_images` | `product_colorways` | CASCADE |
| `product_variants` | `product_colorways` | CASCADE |
| `inventory` | `product_variants` | CASCADE |
| `nike_by_you_options` | `product_colorways` | CASCADE |
| `product_sustainability_materials` | `product_colorways` | CASCADE |
| `carts` | `users` | CASCADE |
| `cart_items` | `carts`, `product_variants` | CASCADE |
| `orders` | `users` | SET NULL |
| `order_items` | `orders`, `product_variants` | RESTRICT |

---

## 7. Inventory & Cart Flow

| Stage | DB Operation | Inventory Change |
|-------|--------------|------------------|
| 1. Browse product | `SELECT` products → colorways → variants → inventory | None |
| 2. Add to cart | `INSERT` cart_items; increase `reserved_quantity` | `reserved_quantity += qty` |
| 3. Cart expires | `DELETE` cart + items (cron / `expires_at`) | `reserved_quantity -= qty` |
| 4. Checkout (COD) | `INSERT` orders + order_items | Lock reservation |
| 5. Order confirmed | `UPDATE` orders.status → `confirmed` | `quantity -= qty`, `reserved_quantity -= qty` |
| 6. Order cancelled | `UPDATE` orders.status → `cancelled` | Restore `quantity` if already deducted |

**MVP note:** With client-side cart, stock is checked at checkout and decremented on order creation/confirmation per [BUSINESS_LOGIC.md](./BUSINESS_LOGIC.md).

---

## 8. OLAP / Analytics *(future)*

Star schema for reporting — separate from OLTP, populated by ETL.

### `fact_sales`

| Column | Type | Role |
|--------|------|------|
| `order_id` | `VARCHAR(50)` | PK |
| `customer_id` | `INT` | FK → `dim_customers` |
| `product_id` | `INT` | FK → `dim_products` |
| `date_key` | `INT` | FK → `dim_date` |
| `order_qty` | `INT` | Measure |
| `unit_price` | `DECIMAL(10,2)` | Measure |
| `total_amount` | `DECIMAL(10,2)` | Measure |

### `dim_customers`

`customer_id`, `customer_name`, `gender`, `city`, `age`

### `dim_products`

`product_id`, `product_type`, `category`, `brand`, `unit_price`

### `dim_date`

`date_key`, `day_of_week`, `quarter`, `year`

---

## 9. RLS Policy Summary

Align with [PERMISSIONS.md](./PERMISSIONS.md):

| Table | Public read | User write | Admin write |
|-------|-------------|------------|-------------|
| `products`, `product_colorways`, `product_images`, `product_variants` | Yes | No | Yes |
| `inventory` | Read stock only | No | Yes |
| `orders` | No | Create + read own | Read all + update status |
| `order_items` | No | Via own orders | All |
| `users`, `roles`, `user_roles` | No | Own profile | All |

---

## 10. DDL Reference

Full PostgreSQL DDL from the design spec:

```sql
-- Roles & Users
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    role_id INT REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Catalog
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    parent_id BIGINT REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    style_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    category_id BIGINT REFERENCES categories(id) ON DELETE RESTRICT,
    sub_title VARCHAR(255),
    base_price DECIMAL(10,2) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    warranty_info VARCHAR(255),
    care_instructions TEXT,
    return_policy TEXT,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_colorways (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    colorway_code VARCHAR(10) NOT NULL,
    full_style_code VARCHAR(50) UNIQUE NOT NULL,
    color_name VARCHAR(150) NOT NULL,
    discount_price DECIMAL(10,2),
    is_customizable BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE product_images (
    id BIGSERIAL PRIMARY KEY,
    colorway_id BIGINT REFERENCES product_colorways(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    image_alt_tag VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0
);

CREATE TABLE product_variants (
    id BIGSERIAL PRIMARY KEY,
    colorway_id BIGINT REFERENCES product_colorways(id) ON DELETE CASCADE,
    size_val VARCHAR(20) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    upc VARCHAR(50) UNIQUE,
    additional_price DECIMAL(10,2) DEFAULT 0.00,
    UNIQUE (colorway_id, size_val)
);

-- Inventory & Customization
CREATE TABLE inventory (
    id BIGSERIAL PRIMARY KEY,
    variant_id BIGINT UNIQUE REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 0,
    reserved_quantity INT DEFAULT 0,
    warehouse_location VARCHAR(100),
    CONSTRAINT chk_quantity CHECK (quantity >= 0),
    CONSTRAINT chk_reserved CHECK (reserved_quantity >= 0)
);

CREATE TABLE nike_by_you_options (
    id BIGSERIAL PRIMARY KEY,
    colorway_id BIGINT REFERENCES product_colorways(id) ON DELETE CASCADE,
    component_name VARCHAR(100) NOT NULL,
    allowed_materials JSONB NOT NULL,
    allowed_colors JSONB NOT NULL
);

-- Cart & Orders
CREATE TABLE carts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

CREATE TABLE cart_items (
    id BIGSERIAL PRIMARY KEY,
    cart_id BIGINT REFERENCES carts(id) ON DELETE CASCADE,
    variant_id BIGINT REFERENCES product_variants(id) ON DELETE CASCADE,
    custom_configuration JSONB,
    quantity INT NOT NULL DEFAULT 1,
    CONSTRAINT chk_cart_qty CHECK (quantity > 0)
);

CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    order_number VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address TEXT NOT NULL,
    payment_intent_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id) ON DELETE RESTRICT,
    variant_id BIGINT REFERENCES product_variants(id) ON DELETE RESTRICT,
    product_name VARCHAR(255) NOT NULL,
    color_name VARCHAR(150) NOT NULL,
    size_val VARCHAR(20) NOT NULL,
    custom_configuration JSONB,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    CONSTRAINT chk_order_qty CHECK (quantity > 0)
);

-- Sustainability
CREATE TABLE product_sustainability_materials (
    id BIGSERIAL PRIMARY KEY,
    colorway_id BIGINT REFERENCES product_colorways(id) ON DELETE CASCADE,
    component_name VARCHAR(100) NOT NULL,
    material_type VARCHAR(100) NOT NULL,
    component_weight_g DECIMAL(6,2) NOT NULL,
    recycled_content_pct DECIMAL(5,2) NOT NULL DEFAULT 0.00
);

-- Indexes
CREATE UNIQUE INDEX idx_products_slug ON products(slug);
CREATE UNIQUE INDEX idx_colorways_full_style ON product_colorways(full_style_code);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_colorways_product ON product_colorways(product_id, is_active);
CREATE INDEX idx_images_colorway ON product_images(colorway_id);
CREATE INDEX idx_variants_colorway ON product_variants(colorway_id);
CREATE INDEX idx_inventory_variant ON inventory(variant_id);
CREATE INDEX idx_carts_session_id ON carts(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX idx_orders_user ON orders(user_id);
```

---