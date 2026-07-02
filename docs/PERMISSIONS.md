# PERMISSIONS.md

## 1. Roles

### Guest

* View products
* View product details

---

### User

* All Guest permissions
* Create orders
* View own orders

---

### Admin

* Full access
* Manage products
* Manage orders
* View all users

---

## 2. Supabase RLS Policies

### Products

* Public read
* Admin write

---

### Orders

User:

* Can create order
* Can view own orders

Admin:

* Can view all orders
* Can update order status

---

### Order Items

* Same as Orders

---

## 3. Auth Rules

* All sensitive actions require authentication
* Admin routes must be protected

---

## 4. Admin Detection

* Use role field in database (e.g., `role = 'admin'`)
* Never trust client role

---

## 5. API Access Control

* Server Actions must validate:

  * user session
  * role

---

## 6. Forbidden Actions

User CANNOT:

* Modify product
* Access other users' orders
* Change order status

---

## 7. Security Notes

* RLS is mandatory
* Always test policies manually
