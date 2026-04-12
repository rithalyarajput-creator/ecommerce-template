# 🛒 TopMTop - Amshine Jewellery E-Commerce Website

Full-stack jewellery e-commerce website built with **React** (Frontend), **PHP** (Backend), and **MySQL** (Database). Features 3-level category hierarchy, multiple product images, external shopping links (Meesho, Flipkart, Amazon), and professional admin panel.

---

## ✨ Features

### 🛍️ Customer Features
- **User Registration & Login** - Secure JWT authentication
- **Product Browsing** - Search, filter by category, sort
- **Multiple Product Images** - Gallery with thumbnails
- **3-Level Categories** - Category > Subcategory > Sub-subcategory
- **External Shopping Links** - Direct buy links for Meesho, Flipkart, Amazon
- **Shopping Cart** - Add, update, remove
- **Wishlist** - Save favorite items
- **Checkout** - Order placement (COD/Online)
- **Order Tracking** - View order history

### 👨‍💼 Admin Features
- **Dashboard** - Stats (Users, Products, Orders, Revenue)
- **Product Management** - Add with multiple images, subcategories, external links
- **Category Management** - Manage 3-level category hierarchy
- **Order Management** - Update order/payment status
- **User Management** - View/delete users

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, React Router, Axios, React Icons, React Toastify |
| **Backend** | PHP 8.3, PDO MySQL |
| **Database** | MySQL / MariaDB |
| **Auth** | JWT (custom), bcrypt |

---

## 📁 Project Structure

```
ecommerce-template/
├── frontend/              # React Frontend
│   └── src/
│       ├── components/   # Navbar, Footer, Hero, ProductCard
│       ├── context/      # AuthContext, CartContext
│       ├── pages/        # Home, Products, ProductDetail, Admin, etc.
│       └── utils/        # api.js
│
├── backend/              # PHP Backend
│   ├── config/           # database.php, cors.php, auth.php
│   ├── api/              # auth, products, cart, orders, admin, subcategories
│   ├── uploads/products/ # Product images (7 jewellery products, 28 images)
│   ├── index.php         # API entry
│   └── fix-admin.php     # One-time admin password fix
│
├── database/
│   └── schema.sql        # Complete DB with 7 products, categories
│
└── necklesh/             # Source product images
```

---

## 🗄️ Database Schema

### Tables:
| Table | Purpose |
|-------|---------|
| `users` | User accounts (admin/user roles) |
| `categories` | Main categories (e.g., Jewellery) |
| `subcategories` | Level 2 (Necklace, Earrings, Mangalsutra, Bridal Sets) |
| `sub_subcategories` | Level 3 (Kundan, Temple, Zircon, Meenakari, etc.) |
| `products` | Products with brand, prices, external links (meesho_link, flipkart_link, amazon_link) |
| `product_images` | Multiple images per product |
| `cart` | Shopping cart items |
| `orders` | Order records |
| `order_items` | Items per order |
| `reviews` | Product reviews |
| `wishlist` | User wishlist |

### Sample Data Included:
- 1 Admin user (`admin@topmtop.com` / `admin123`)
- 1 Category: **Jewellery**
- 4 Subcategories: Necklace, Earrings, Mangalsutra, Bridal Sets
- 6 Sub-subcategories: Kundan, Temple, Zircon/Diamond, Meenakari, Traditional Mangalsutra, Wedding Set
- **7 Amshine Jewellery Products** (with 4 images each = 28 images total):
  1. Gold Plated Kundan Jhumka Necklace Set (Red & Green)
  2. Silver Plated Double Layer Zircon Necklace
  3. Lotus Meenakari Enamel Necklace
  4. Antique Gold Temple Necklace with Pearls
  5. Silver Plated Bridal Zircon Leaf Necklace
  6. Traditional Gold Plated Mangalsutra
  7. Gold Plated Bridal Zircon Set with Maang Tikka

---

## 🚀 Local Setup (XAMPP)

### Prerequisites
- **XAMPP** (Apache + MySQL + PHP) - [Download](https://www.apachefriends.org/)
- **Node.js** v16+ - [Download](https://nodejs.org/)

### Step 1: Database Setup
1. Start **Apache** and **MySQL** in XAMPP
2. Open `http://localhost/phpmyadmin`
3. Click **Import** → select `database/schema.sql` → Go
4. Database `topmtop_db` will be created with all sample data

### Step 2: Backend Setup
1. Copy `backend/` folder to `C:\xampp\htdocs\` (or Mac/Linux equivalent)
2. Edit `backend/config/database.php` if needed (default: root with no password)
3. Test: `http://localhost/backend/` should return JSON

### Step 3: Frontend Setup
```bash
cd frontend
npm install
```

Create `.env` file:
```
REACT_APP_API_URL=http://localhost/backend
```

Start:
```bash
npm start
```

Open: `http://localhost:3000`

---

## 🔑 Default Login

- **Email:** `admin@topmtop.com`
- **Password:** `admin123`

If login fails, visit `http://localhost/backend/fix-admin.php` once to reset admin password.

---

## 📡 API Endpoints

### Products (`/api/products.php`)
| Action | Method | Description |
|--------|--------|-------------|
| `list` | GET | List products (filter/search/sort/paginate) |
| `featured` | GET | Featured products |
| `detail` | GET | Product with all images + reviews |
| `create` | POST | Add product (admin) - supports multiple images |
| `update` | POST | Update product (admin) |
| `delete` | DELETE | Delete product (admin) |

### Categories (`/api/categories.php`)
- `list`, `create`, `delete`

### Subcategories (`/api/subcategories.php`)
- `list` (by category_id), `sub-sub` (by subcategory_id)
- `create-sub`, `create-sub-sub`
- `delete-sub`, `delete-sub-sub`

### Auth (`/api/auth.php`)
- `register`, `login`, `profile`

### Cart (`/api/cart.php`) — Auth required
- `list`, `add`, `update`, `remove`, `clear`

### Orders (`/api/orders.php`)
- `create` (user), `my-orders` (user), `all` (admin), `update-status` (admin)

### Wishlist (`/api/wishlist.php`) — Auth required
- `list`, `add`, `remove`

### Reviews (`/api/reviews.php`)
- `add`, `product`

### Admin (`/api/admin.php`) — Admin only
- `dashboard`, `users`, `delete-user`

---

## 🎨 Product Features

### Multiple Images
Each product supports multiple images (gallery style). Main image + additional images stored in `product_images` table.

### External Shopping Links
Each product can have links to:
- 🛒 **Meesho** (`meesho_link`)
- 🛍️ **Flipkart** (`flipkart_link`)
- 📦 **Amazon** (`amazon_link`)

These show as colored buttons on product detail page.

### 3-Level Category Hierarchy
```
Jewellery (Category)
├── Necklace (Subcategory)
│   ├── Kundan Necklace (Sub-subcategory)
│   ├── Temple Jewellery
│   ├── Zircon/Diamond
│   └── Enamel/Meenakari
├── Earrings
├── Mangalsutra
│   └── Traditional Mangalsutra
└── Bridal Sets
    └── Wedding Set
```

---

## 🎨 Theme

- **Primary Blue:** `#2874f0` (Flipkart-style)
- **Orange Accent:** `#ff9f00`, `#fb641b`
- **Light Background:** `#f1f3f6`
- **Dark Text:** `#212121`
- **Gray Text:** `#878787`

---

## 📦 Running in Codespaces (Development)

If using GitHub Codespaces for development:

```bash
# 1. Start MySQL
sudo mysqld --user=$USER --datadir=/var/lib/mysql --socket=/var/run/mysqld/mysqld.sock &

# 2. Import database
mysql -uroot < database/schema.sql

# 3. Start PHP backend on port 5000
cd backend && /usr/bin/php8.3 -S 0.0.0.0:5000 -t . &

# 4. Start React frontend
cd frontend
npm install
npm start
```

Frontend proxies `/api/*` to port 5000 (configured in `package.json`).

---

## 👨‍💻 Author

**Rithalya Rajput**
- GitHub: [@rithalyarajput-creator](https://github.com/rithalyarajput-creator)
- Brand: **Amshine** Jewellery

---

## 📄 License

MIT License
