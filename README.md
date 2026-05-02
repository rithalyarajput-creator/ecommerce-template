# TopMTop - Amshine Jewellery E-Commerce Website

Full-stack jewellery e-commerce platform built with **React** (Frontend), **PHP** (Backend), and **MySQL** (Database). Features role-based access for Customers, Sellers, and Admin — with a complete Seller Dashboard, Flipkart-style bulk Excel import/export, smart login popup, and 3-level product category hierarchy.

---

## Features

### Customer Features
- Role-based login — Customer / Seller / Admin welcome screen
- Secure JWT authentication with bcrypt password hashing
- Product browsing with search, category filter, and sort
- 3-level category hierarchy (Category > Subcategory > Sub-subcategory)
- Multiple product images with gallery thumbnails
- External buy links — Meesho, Flipkart, Amazon
- Add to Cart with login popup (no page redirect — popup appears, login, done)
- Wishlist — save favourite items
- Checkout — COD / Online payment
- Order history and tracking
- Product enquiry form
- Coupon codes at checkout

### Seller Features
- Separate Seller registration and login flow
- "Become a Seller" onboarding page
- Seller Dashboard (Flipkart-style purple sidebar):
  - Dashboard — stats overview
  - My Products — add, edit, delete own products
  - My Orders — only orders containing seller's products
  - Shop Profile — manage shop name and description
- Products are linked to seller account

### Admin Features
- Secret admin login — click brand logo 5 times on login page
- Dashboard — total users, products, orders, revenue
- Product Management — add, edit, delete, multiple images
- Excel Import/Export — bulk upload products via CSV (Flipkart-style)
- Category Management — full 3-level hierarchy
- Order Management — update status and payment status
- User Management — view and delete users
- Seller Management — approve/manage seller accounts
- Coupon Management — create, edit, activate/deactivate coupons
- Lead Management — enquiries from product pages

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router v7, Axios, React Icons, React Toastify |
| Backend | PHP 8.3, PDO MySQL |
| Database | MySQL / MariaDB |
| Auth | JWT (custom implementation), bcrypt |

---

## Project Structure

```
ecommerce-template/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Navbar/          # Role-aware navbar (Become a Seller + Sign In for guests)
│       │   ├── Footer/
│       │   └── ProductCard/     # Login popup on Add to Cart
│       ├── context/
│       │   ├── AuthContext.js   # JWT auth state
│       │   ├── CartContext.js   # Cart state
│       │   └── LoginPopupContext.js  # Global login modal
│       ├── pages/
│       │   ├── Home/
│       │   ├── Products/
│       │   ├── ProductDetail/   # Login popup on Add to Cart / Wishlist
│       │   ├── Cart/
│       │   ├── Checkout/        # Coupon code support
│       │   ├── Login/           # Welcome screen with Customer/Seller/Admin flows
│       │   ├── Register/        # Customer or Seller type selection
│       │   ├── Profile/
│       │   ├── Orders/
│       │   ├── Wishlist/
│       │   ├── BecomeSeller/    # Seller onboarding
│       │   ├── SellerDashboard/ # Full seller panel
│       │   └── Admin/           # Admin panel with Excel import/export
│       └── utils/
│           └── api.js
│
├── backend/
│   ├── config/
│   │   ├── database.php
│   │   ├── cors.php
│   │   └── auth.php
│   └── api/
│       ├── auth.php
│       ├── products.php
│       ├── categories.php
│       ├── subcategories.php
│       ├── cart.php
│       ├── orders.php
│       ├── wishlist.php
│       ├── reviews.php
│       ├── admin.php
│       ├── seller.php           # Seller dashboard API
│       ├── coupons.php
│       ├── leads.php
│       └── excel-import.php     # Bulk CSV product import
│
└── database/
    ├── schema.sql               # Full DB schema + sample data
    └── migrations/
        └── 2026_05_seller_support.sql  # Seller role migration
```

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `users` | Accounts with role: `user`, `seller`, `admin` |
| `categories` | Main categories |
| `subcategories` | Level 2 categories |
| `sub_subcategories` | Level 3 categories |
| `products` | Products with brand, prices, seller_id, external links |
| `product_images` | Multiple images per product |
| `seller_profiles` | Seller shop info |
| `cart` | Cart items per user |
| `orders` | Order records |
| `order_items` | Items per order with seller_id |
| `reviews` | Product reviews |
| `wishlist` | User wishlists |
| `coupons` | Discount coupon codes |
| `leads` | Product enquiry submissions |

---

## Local Setup (XAMPP on Windows)

### Requirements
- **XAMPP** — Apache + MySQL + PHP — [apachefriends.org](https://www.apachefriends.org/)
- **Node.js** v16 or higher — [nodejs.org](https://nodejs.org/)

### Step 1 — Database
1. Start Apache and MySQL in XAMPP Control Panel
2. Open `http://localhost/phpmyadmin`
3. Click **Import** → select `database/schema.sql` → Go
4. Database `topmtop_db` is created with sample data
5. Run seller migration: Import `database/migrations/2026_05_seller_support.sql`

### Step 2 — Backend
1. Copy the `backend/` folder to `C:\xampp\htdocs\backend\`
2. Edit `backend/config/database.php` if needed (default: root, no password)
3. Test: open `http://localhost/backend/` — should return JSON

### Step 3 — Frontend
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```
REACT_APP_API_URL=http://localhost/backend
```

Start the dev server:
```bash
npm start
```

Open: `http://localhost:3000`

---

## Default Login Credentials

### Admin (Secret Access)
On the login page, click the **brand logo 5 times** — the Admin login panel appears.
- Email: `admin@topmtop.com`
- Password: `admin123`

To create via phpMyAdmin SQL:
```sql
INSERT INTO users (name, email, password, phone, role)
VALUES ('Admin', 'admin@topmtop.com', '$2y$10$RPgkQF/yYchYDR3pgtQ0X..9jALO1vWU8Qj.cgp0fQvkJWLo9gi76', '9000000000', 'admin');
```

### Seller
Register at `/register` → select **Seller** → fill the form.  
Or via phpMyAdmin — insert user with `role = 'seller'` and add a row in `seller_profiles`.

### Customer
Register at `/register` → select **Customer** → fill the form.

---

## Login Flow

```
/login
  ├── Customer → Customer login form → redirects to Home
  ├── Seller   → Seller login form  → redirects to /seller
  └── [click logo 5x] → Admin login → redirects to /admin
```

Guests clicking **Add to Cart** or **Wishlist** see a login popup modal instead of being redirected — after login the original action completes automatically.

---

## Excel Import / Export (Admin)

In Admin → Products tab:

- **Export** — downloads all products as a CSV file (Excel-compatible, UTF-8 BOM)
- **Template** — downloads a blank CSV with all column headers
- **Import** — upload a filled CSV to bulk-add products

CSV columns: `name, description, price, sale_price, stock, brand, sku, category_id, subcategory_id, sub_subcategory_id, image, meesho_link, flipkart_link, amazon_link`

---

## API Endpoints

### Auth (`/api/auth.php`)
| Action | Method | Description |
|--------|--------|-------------|
| `register` | POST | Register new user |
| `login` | POST | Login, returns JWT |
| `profile` | GET | Get/update profile |

### Products (`/api/products.php`)
| Action | Method | Description |
|--------|--------|-------------|
| `list` | GET | List with filter, search, sort, pagination |
| `featured` | GET | Featured products for homepage |
| `detail` | GET | Full product with images and reviews |
| `similar` | GET | Similar products by category |
| `create` | POST | Add product (admin) |
| `update` | POST | Update product (admin) |
| `delete` | DELETE | Delete product (admin) |

### Seller (`/api/seller.php`)
| Action | Method | Description |
|--------|--------|-------------|
| `become-seller` | POST | Apply as seller |
| `dashboard` | GET | Seller stats |
| `my-products` | GET | Seller's own products |
| `add-product` | POST | Add product as seller |
| `delete-product` | DELETE | Delete own product |
| `my-orders` | GET | Orders with seller's items |
| `profile` | GET/POST | Shop profile |
| `admin-list` | GET | All sellers (admin) |
| `admin-update-status` | PUT | Approve/reject seller (admin) |

### Coupons (`/api/coupons.php`)
- `validate` (POST, public), `list` (GET, admin), `create`, `update`, `delete`

### Other Endpoints
- `/api/categories.php` — `list`, `create`, `delete`
- `/api/subcategories.php` — `list`, `sub-sub`, `create-sub`, `create-sub-sub`, `delete-sub`, `delete-sub-sub`
- `/api/cart.php` — `list`, `add`, `update`, `remove`, `clear`
- `/api/orders.php` — `create`, `my-orders`, `all`, `update-status`
- `/api/wishlist.php` — `list`, `add`, `remove`
- `/api/reviews.php` — `add`, `product`
- `/api/admin.php` — `dashboard`, `users`, `delete-user`
- `/api/leads.php` — `create`, `list` (admin)
- `/api/excel-import.php` — bulk CSV product import (admin)

---

## Theme / Design

- Primary Blue: `#2874f0`
- Orange Accent: `#ff9f00`, `#fb641b`
- Seller Purple: `#7c3aed`
- Background: `#f1f3f6`
- Dark Text: `#212121`
- Gray Text: `#878787`

---

## Running in GitHub Codespaces

```bash
# Start MySQL
sudo mysqld --user=$USER --datadir=/var/lib/mysql --socket=/var/run/mysqld/mysqld.sock &

# Import database
mysql -uroot < database/schema.sql
mysql -uroot topmtop_db < database/migrations/2026_05_seller_support.sql

# Start PHP backend on port 5000
cd backend && /usr/bin/php8.3 -S 0.0.0.0:5000 -t . &

# Start React frontend
cd frontend && npm install && npm start
```

Frontend proxies `/api/*` to port 5000 (set in `package.json` proxy).

---

## Author

**Rithalya Rajput**  
GitHub: [@rithalyarajput-creator](https://github.com/rithalyarajput-creator)  
Brand: **Amshine** Jewellery
