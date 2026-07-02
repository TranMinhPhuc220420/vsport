# Phase 4 — Cart & COD Checkout

Client-side cart, authenticated COD checkout, order creation, confirmation, and order history.

## Scope

| Item | Status |
|------|--------|
| Client-side cart (localStorage) | Done |
| Cart page: view, update quantity, remove | Done |
| Merge cart after login (localStorage persists) | Done |
| Checkout page (auth required): name, phone, address | Done |
| Validate stock before creating order | Done |
| Create order `pending` + `order_items` snapshot | Done |
| Stock deduction at checkout | No — admin confirm in Phase 5 |
| Order confirmation page | Done |
| Order history (logged-in user) | Done |

## Architecture

```
PDP Add to Bag → localStorage (vsport:cart:v1)
/cart → client cart UI
/checkout → auth + POST → OrderCheckoutService → orders + order_items
/orders/confirmation/{orderNumber} → thank you + clear cart
/orders → user's order list
```

Checkout requires authentication. Guest users can add to bag but must sign in before placing an order.

## Inventory rule

Stock is validated at checkout using `inventory.availableQuantity()`. Physical stock is **not** deducted when the order is created. Deduction happens when admin confirms the order (`pending → confirmed`) in Phase 5.

## API / routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/cart` | Public | Cart page |
| GET | `/checkout` | Yes | Checkout form |
| POST | `/checkout` | Yes | Place order |
| GET | `/orders/confirmation/{orderNumber}` | Yes | Confirmation |
| GET | `/orders` | Yes | Order history |
| GET | `/orders/{orderNumber}` | Yes | Order detail |

POST `/checkout` body:

```json
{
  "customerName": "Jane Doe",
  "customerPhone": "+84901234567",
  "shippingAddress": "123 Street, City",
  "items": [{ "variantId": 1, "quantity": 2 }]
}
```

Server recomputes `unit_price` from `ProductVariant::unitPrice()`. Out-of-stock lines return `422` with `items.{index}.variantId` errors.

## Key files

| Layer | Path |
|-------|------|
| Cart context | `resources/js/contexts/cart-context.tsx` |
| Cart hook | `resources/js/hooks/use-cart-storage.ts` |
| Checkout service | `app/Services/Order/OrderCheckoutService.php` |
| Controllers | `app/Http/Controllers/Storefront/{Cart,Checkout,Order*}Controller.php` |
| Policy | `app/Policies/OrderPolicy.php` |
| Pages | `resources/js/pages/storefront/{cart,checkout,orders/*}.tsx` |

## Verification

```bash
php artisan test --filter=Checkout
npm run build
```

Manual smoke (signed-in user):

1. PDP → Add to Bag → badge updates
2. `/cart` → change qty, remove item
3. `/checkout` → submit → confirmation, cart cleared
4. `/orders` → new `pending` order listed
5. Jordan 1 Low US 12 → checkout rejected
