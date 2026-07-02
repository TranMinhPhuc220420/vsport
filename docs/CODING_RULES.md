# CODING_RULES.md

## 1. General Principles

* Keep code simple and readable
* Avoid over-engineering

---

## 2. Project Structure
?

### Design systems

| Surface | Doc | Components |
|---------|-----|------------|
| Customer storefront | [DESIGN.md](DESIGN.md) | `resources/js/components/storefront/` |
| Admin panel | [DESIGN_ADMIN.md](DESIGN_ADMIN.md) | `resources/js/components/admin/` |

Do not import storefront components into admin pages (or vice versa). Admin layout is scoped with `.vsport-admin` in `resources/css/admin.css` (Stripe palette: primary `#0A2540`, tertiary CTA `#635BFF`, neutral canvas `#F6F9FC`). Use **one tertiary button per screen**.

---

---

## 3. Data Access Rules
?
---

## 4. Server Actions
?
Example:

* createOrder
* updateOrderStatus

---

## 6. Validation

* Validate all inputs on server
* Do NOT trust client input

---

## 7. Error Handling

* Always return structured errors
* Do not expose raw database errors

---

## 8. Naming Convention

* camelCase for variables
* PascalCase for components
* snake_case for database fields

---

## 9. Security Rules

* Never expose service role key to client
* Always use RLS for protected data

---

## 10. Performance

* Use pagination for lists
* Avoid fetching unnecessary fields
* Cache when possible

---

## 11. Code Style

* Small functions
* Avoid deeply nested logic
* Prefer composition over complexity
