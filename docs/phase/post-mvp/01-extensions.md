# Phase 7 — Post-MVP Extensions

Implementation notes for server cart, discounts, Stripe, reviews, sustainability, Nike By You, and in-app analytics ETL.

## 7.1 Server-side cart + reservation

- Tables: `carts`, `cart_items`
- `CartService` reserves/releases `inventory.reserved_quantity` on add/update/remove
- API: `GET/POST/PATCH/DELETE /api/cart` (web middleware + session cookie for guests)
- `carts:release-expired` scheduled hourly
- Checkout reads the authenticated user's server cart (no client `items` payload)
- `OrderStatusService`: confirm deducts `quantity` + `reserved_quantity`; pending cancel releases reservation

**Smoke:** add to bag → checkout → admin confirm → inventory decreases.

## 7.2 Discount codes

- Table: `discount_codes`; `orders.discount_code_id`, `orders.discount_amount`
- Admin CRUD: `/admin/discount-codes`
- Checkout promo field + `POST /api/discount/validate`
- Snapshot stored on order; `used_count` incremented at checkout

## 7.3 Stripe (COD remains default)

- `orders.payment_method` (`cod` | `stripe`)
- `StripeCheckoutService` creates PaymentIntent; `POST /stripe/webhook` (signed)
- Checkout UI: payment method radio; Stripe Elements on `storefront/checkout-stripe`
- Env: `STRIPE_KEY`, `STRIPE_SECRET`, `STRIPE_WEBHOOK_SECRET`

## 7.4 Reviews

- Table: `product_reviews` (unique per user/product)
- PDP review list + submit form (auth); admin moderation `/admin/reviews`
- `ReviewService` recalculates `products.average_rating` / `review_count` on approve

## 7.5 Sustainability

- Table: `product_sustainability_materials` per colorway
- `SustainabilityCalculator` weighted recycled %
- PDP accordion "Move to Zero" per colorway

## 7.6 Nike By You

- Table: `nike_by_you_options` per customizable colorway
- PDP customizer when `is_customizable`; JSON stored on `cart_items` / `order_items.custom_configuration`

## 7.7 OLAP / analytics

- Star schema: `dim_date`, `dim_customers`, `dim_products`, `fact_sales`
- `php artisan analytics:sync` (daily schedule) from `completed` orders
- Admin dashboard: `/admin/analytics`

## Verification

```bash
php artisan test
php artisan migrate
npm run build
```

## Stock rules (post-7.1)

| Event | `quantity` | `reserved_quantity` |
|-------|------------|---------------------|
| Add to cart | — | +qty |
| Remove / expire cart | — | −qty |
| Checkout (pending order) | — | unchanged |
| Admin confirm | −qty | −qty |
| Cancel pending | — | −qty |
| Cancel after confirm | +qty | — |
