# Phase 1 — Storefront UX Consistency

Unify the customer account and settings experience under the Nike-style storefront design system. Eliminate the split where profile uses `storefront/settings/*` but security and appearance still use the Laravel starter `AppLayout`.

**Priority:** P0  
**Estimated effort:** 3–5 days  
**Status:** Done

---

## Goal

A logged-in **customer** never leaves the storefront visual language when managing their account. Admins may continue using the legacy settings layout or admin panel for profile — existing behavior in [`ProfileController`](../../app/Http/Controllers/Settings/ProfileController.php) is acceptable.

---

## Prerequisites

- [x] Phase 0–7 complete (baseline)
- [x] Auth login/register storefront layout merged (or complete as part of this phase)

---

## Scope checklist

### 1.1 Auth pages (finish in-flight work)

- [x] Confirm [`auth-storefront-layout.tsx`](../../resources/js/layouts/auth/auth-storefront-layout.tsx) is used for all auth pages (login, register, forgot/reset password, verify email, 2FA challenge)
- [x] Login and register use editorial images (`/images/bg-login.jpg`, `/images/bg-register.jpg`)
- [x] [`auth-benefits-list.tsx`](../../resources/js/components/storefront/auth/auth-benefits-list.tsx) copy is complete in `en` and `vi` locales
- [x] Auth pages do not import admin or legacy `AppLayout` components
- [x] Visual QA at mobile + `tablet-lg` breakpoints

### 1.2 Storefront security settings page

- [x] Create `resources/js/pages/storefront/settings/security.tsx` using storefront components (`StorefrontButton`, `AuthInput`, etc.)
- [x] Reuse existing logic from [`settings/security.tsx`](../../resources/js/pages/settings/security.tsx): password change, 2FA, passkeys
- [x] Update [`SecurityController`](../../app/Http/Controllers/Settings/SecurityController.php) to render `storefront/settings/security` when `$request->user()->isCustomer()`
- [x] Flash toasts use storefront pattern (match profile page)
- [x] i18n strings added to `resources/js/locales/{en,vi}/storefront.json` under `settings.security.*`

### 1.3 Storefront appearance settings page

- [x] Create `resources/js/pages/storefront/settings/appearance.tsx`
- [x] Port theme toggle from [`settings/appearance.tsx`](../../resources/js/pages/settings/appearance.tsx) with storefront styling
- [x] Route remains `GET /settings/appearance` — controller chooses view by role (or dedicated storefront controller method)
- [x] i18n strings under `settings.appearance.*`

### 1.4 Settings navigation

- [x] Extend [`settings-nav.tsx`](../../resources/js/components/storefront/settings/settings-nav.tsx) with:
  - Profile → `/settings/profile`
  - Security → `/settings/security`
  - Appearance → `/settings/appearance`
- [x] Mobile nav (`SettingsNavMobile`) includes all three items
- [x] Active state highlights current route
- [x] [`storefront-settings-layout.tsx`](../../resources/js/layouts/storefront/storefront-settings-layout.tsx) shows nav on desktop, horizontal scroll on mobile

### 1.5 App layout routing

- [x] Update [`app.tsx`](../../resources/js/app.tsx) layout switch:
  - Customers on `settings/security` and `settings/appearance` should use `[StorefrontLayout, StorefrontSettingsLayout]` when using storefront page paths
  - Prefer moving customer pages to `storefront/settings/*` paths consistently
- [x] Admin users keep `settings/*` + `AppLayout` for security/appearance

### 1.6 Account hub links

- [x] [`storefront/account/index.tsx`](../../resources/js/pages/storefront/account/index.tsx) links to profile settings (already done — verify)
- [x] Add quick link to Security from account page (optional card or secondary CTA)
- [x] Primary nav / user menu links to `/dashboard` and `/settings/profile` for logged-in customers

### 1.7 Delete account section

- [x] Confirm [`delete-account-section.tsx`](../../resources/js/components/storefront/settings/delete-account-section.tsx) works end-to-end on storefront profile
- [x] Destructive action uses storefront modal/dialog styling

### 1.8 Tests

- [x] Extend [`ProfileUpdateTest.php`](../../tests/Feature/Settings/ProfileUpdateTest.php) pattern for security:
  - Customer GET `/settings/security` → `storefront/settings/security`
  - Admin GET `/settings/security` → `settings/security`
- [x] Add appearance view routing test (customer vs admin)
- [x] Password update smoke test for customer storefront page

---

## Key files

| Layer | Path |
|-------|------|
| Layout | `resources/js/layouts/storefront/storefront-settings-layout.tsx` |
| Nav | `resources/js/components/storefront/settings/settings-nav.tsx` |
| Pages | `resources/js/pages/storefront/settings/{profile,security,appearance}.tsx` |
| Controllers | `app/Http/Controllers/Settings/{Profile,Security}Controller.php` |
| Inertia layout | `resources/js/app.tsx` |
| Locales | `resources/js/locales/{en,vi}/storefront.json` |
| Tests | `tests/Feature/Settings/` |

---

## Acceptance criteria

1. Customer journey: Home → Account → Settings → Profile / Security / Appearance — all pages share storefront header, footer, and settings sidebar.
2. No visual regression on admin settings pages.
3. 2FA enrollment and passkey management work identically after migration.
4. All new strings translated in English and Vietnamese.

---

## Verification

```bash
php artisan test --filter=Settings
php artisan test --filter=ProfileUpdate
npm run types:check
npm run lint:check
```

Manual QA checklist:

- [x] Customer: change password on storefront security page
- [x] Customer: toggle light/dark on storefront appearance page
- [x] Admin: security page unchanged (legacy layout)
- [x] Mobile: settings nav scrolls horizontally without layout break

---

## Out of scope

- Moving admin users to storefront settings
- New account features (addresses, wishlist sync) — see [Phase 4](./04-customer-experience.md)

---

## Progress log

| Date | Task | Notes |
|------|------|-------|
| 2026-07-06 | 1.1 | Auth pages already migrated to `auth-storefront-layout` (editorial images, benefits copy) in prior work this cycle; confirmed all `auth/*` pages route through it via `auth-layout.tsx` dispatcher. |
| 2026-07-06 | 1.2–1.8 | Added `AppearanceController`, role-branched `SecurityController::edit`, storefront `security.tsx`/`appearance.tsx` pages, extended settings nav + dynamic breadcrumb, i18n strings (en/vi), security quick link on account hub, feature tests. Verified in-browser (Playwright) as customer and admin, desktop + mobile; `php artisan test --filter=Settings` (20 passed). Pre-existing unrelated ESLint/TypeScript issues elsewhere in the repo were left untouched (out of scope). |
