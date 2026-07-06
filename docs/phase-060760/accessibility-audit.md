# Accessibility audit (Phase 6)

Spot-check completed July 2026 against home, PDP, checkout, and storefront settings. Tool: Chrome Lighthouse accessibility category + manual keyboard pass.

## Pages reviewed

| Page | Route | Result |
|------|-------|--------|
| Home | `/` | Pass — headings hierarchy OK; campaign hero has alt text when image present |
| PDP | `/products/zegama-2` | Pass — size picker buttons expose labels; add-to-bag disabled state communicated |
| Checkout | `/checkout` | Pass — form fields use visible labels via `AuthField` / `checkout-form` |
| Storefront settings | `/settings/profile` | Pass — settings nav has `aria-label`; delete account section uses dialog |

## Fixes applied in Phase 6

- Stable `data-testid` hooks on revenue-critical controls (add-to-bag, checkout-submit, login-submit, admin-order-confirm) — improves automated testing without changing visual design.

## Known acceptable warnings

| Warning | Context | Action |
|---------|---------|--------|
| Color contrast on `text-mute` captions | Meets design system; some captions borderline on `soft-cloud` | Monitor; adjust token if Lighthouse flags below AA |
| Mobile nav focus trap | Radix/shadcn drawer — verify on device if menu UX changes | No change in Phase 6 |
| Third-party Stripe Elements | Only on Stripe checkout page | Stripe iframe handles internal a11y |

## Re-audit triggers

- Major layout changes to `storefront-layout`, `checkout.tsx`, or `auth-storefront-layout`
- New interactive components without Radix primitives
- Before public marketing campaigns driving traffic spikes
