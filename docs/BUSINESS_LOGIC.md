# BUSINESS_LOGIC.md

## 1. Overview

VSport is an e-commerce platform for selling sports products.

Core principles:

* COD (Cash on Delivery) only
* Fast checkout
* Minimal friction for users
* Admin-controlled order lifecycle

---

## 2. User Roles

* Guest (not logged in)
* User (customer)
* Admin

---

## 3. Product Flow

### Product Listing

* Public access
* Filter by category
* Pagination required

### Product Detail

* Show images, price, description
* Show stock status

---

## 4. Cart Logic

* Cart is client-based (local storage or session)
* No database persistence required (MVP)
* Merge cart after login (optional)

---

## 5. Checkout Flow (COD)

1. User clicks "Checkout"
2. User enters:

   * Name
   * Phone
   * Address
3. Create Order with status = `pending`

---

## 6. Order Lifecycle

Order status flow:

pending → confirmed → shipping → delivered → completed

Optional:

* cancelled

---

## 7. Admin Order Management

Admin can:

* View all orders
* Update order status
* Cancel order

---

## 8. Inventory Logic

* Each product has stock quantity
* Reduce stock on order creation (or confirmation)
* Prevent checkout if out of stock

---

## 9. Image Handling

* Upload via Supabase Storage
* Store public URL in database

---

## 10. Error Handling

* Invalid checkout → reject
* Out of stock → reject
* Unauthorized → block

---

## 11. Future Extensions

* Online payment
* Discount codes
* Reviews & ratings
