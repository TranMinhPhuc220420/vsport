# Phase 0 — Project Foundation

Application scaffold and user authentication with role-based admin access.

## Scope

| Item | Status |
|------|--------|
| Laravel + Inertia + React + TypeScript setup | Done |
| Auth: register, login, forgot password, email verification | Done |
| 2FA and Passkeys (Fortify) | Done |
| Settings pages: profile, security, appearance | Done |
| `admin` / `customer` roles on `users` | Done |
| Middleware to protect admin routes | Done |
| Seed default admin user | Done |

## Role model

Roles are stored as a `role` column on the `users` table (not a separate `roles` table).

| Role | DB value | Assigned when |
|------|----------|---------------|
| Guest | (no row) | Not logged in |
| Customer | `customer` | Registration (default); factory default |
| Admin | `admin` | Seeder only — never via registration |

See [PERMISSIONS.md](../../PERMISSIONS.md) for access rules.

### PHP enum

`App\Enums\UserRole` — backed string enum with `Admin` and `Customer` cases.

### User model helpers

- `isAdmin(): bool`
- `isCustomer(): bool`

`role` is **not** in `$fillable` to prevent mass-assignment from HTTP requests.

## Admin middleware

`App\Http\Middleware\EnsureUserIsAdmin` is registered as the `admin` middleware alias.

Apply to all admin routes:

```php
Route::middleware(['auth', 'verified', 'admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        // ...
    });
```

- Guests → redirected to login by `auth`
- Customers → `403 Forbidden`
- Admins → allowed

## Admin routes

Defined in `routes/admin.php`, loaded from `bootstrap/app.php`.

| Route | Name | Page |
|-------|------|------|
| `GET /admin` | `admin.dashboard` | `admin/dashboard` |

## Seeding the default admin

Configure in `.env`:

```
ADMIN_NAME=Admin
ADMIN_EMAIL=admin@vsport.local
ADMIN_PASSWORD=password
```

Run:

```bash
php artisan db:seed --class=AdminUserSeeder
```

Or seed everything:

```bash
php artisan db:seed
```

The seeder uses `updateOrCreate` on email, so it is safe to re-run.

## Frontend

`HandleInertiaRequests` shares `auth.user.role` (`'admin'` | `'customer'`) with every Inertia page.

TypeScript type: `UserRole` in `resources/js/types/auth.ts`.

## Verification

```bash
php artisan migrate
php artisan db:seed --class=AdminUserSeeder
php artisan test --filter=Admin
php artisan test --filter=Registration
```

Manual smoke test:

1. Register a new user → `/dashboard` works, `/admin` returns 403
2. Log in as `ADMIN_EMAIL` → `/admin` loads

## Out of scope

- ~~Admin UI shell and design tokens (Phase 1)~~ — **Done**: separate admin design system in [DESIGN_ADMIN.md](../../DESIGN_ADMIN.md); preview at `/admin/preview/design-system`
- Normalized `roles` / `user_roles` tables (future if `staff` role is needed)
- Full `users` schema from [DB_SCHEMA.md](../../DB_SCHEMA.md) (`first_name`, `last_name`, etc.) — Phase 2
- Per-resource Gates/Policies — Phase 5–6
