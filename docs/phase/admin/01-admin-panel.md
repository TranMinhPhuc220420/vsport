# Phase 5 — Admin Panel

Admin UI for catalog, inventory, orders, and user role management. All routes live under `/admin` behind `auth`, `verified`, and `admin` middleware.

## Dashboard (`/admin`)

- Pending order count
- Revenue from completed orders
- Product count
- Five most recent orders with links to detail

## Categories

| Method | Route | Action |
|--------|-------|--------|
| GET | `/admin/categories` | List categories |
| GET/POST | `/admin/categories/create` | Create form / store |
| GET/PUT/DELETE | `/admin/categories/{category}/edit` | Edit / update / destroy |

Deletion is blocked when a category has products or child categories.

## Products

| Method | Route | Action |
|--------|-------|--------|
| GET | `/admin/products` | Product list |
| GET/POST | `/admin/products/create` | Create product + first colorway + variants |
| GET/PUT/DELETE | `/admin/products/{slug}/edit` | Edit product, manage colorways |
| POST | `/admin/products/{product}/colorways` | Add colorway |
| PUT/DELETE | `/admin/colorways/{colorway}` | Update / delete colorway |
| POST | `/admin/colorways/{colorway}/variants` | Sync sizes + inventory quantities |
| PATCH | `/admin/variants/{variant}/inventory` | Update single variant quantity |
| POST | `/admin/colorways/{colorway}/images` | Upload image (JSON response) |

`ProductAdminService` handles nested create/sync in transactions. SKUs follow `{style}-{colorway}-{size}`.

## Orders

| Method | Route | Action |
|--------|-------|--------|
| GET | `/admin/orders` | List with `?status=` filter |
| GET | `/admin/orders/{orderNumber}` | Detail + allowed status actions |
| PATCH | `/admin/orders/{orderNumber}/status` | Transition status |

### Stock rules (`OrderStatusService`)

- **`pending → confirmed`**: deduct `inventory.quantity` per line item (fails if insufficient)
- **Cancel from `confirmed|shipping|delivered`**: restore stock
- **`pending → cancelled`**: no inventory change

Allowed transitions:

```
pending → confirmed, cancelled
confirmed → shipping, cancelled
shipping → delivered, cancelled
delivered → completed, cancelled
completed → (terminal)
cancelled → (terminal)
```

## Users

| Method | Route | Action |
|--------|-------|--------|
| GET | `/admin/users` | Paginated list, `?search=` on name/email |
| PATCH | `/admin/users/{user}/role` | Change role |

Safeguards:

- Admins cannot demote themselves
- Cannot demote the last remaining admin

## Frontend

Inertia pages under `resources/js/pages/admin/`:

- `dashboard.tsx`
- `categories/{index,create,edit}.tsx`
- `products/{index,create,edit}.tsx` — edit page includes colorway forms, inventory grid, and image upload
- `orders/{index,show}.tsx`
- `users/index.tsx`

Sidebar links are wired in `admin-sidebar.tsx`.

## Tests

```bash
php artisan test --filter=Admin
```

Coverage includes catalog access, category CRUD, product create + inventory PATCH, order list/filter, confirm/cancel stock flows, and user role safeguards.

## Manual verification

1. Log in as admin → `/admin` shows live stats
2. Confirm a pending order → variant stock decreases
3. Cancel a confirmed order → stock restored
4. CRUD category and product; upload a colorway image on product edit
5. `/admin/users` — change a customer role (not your own admin account)
