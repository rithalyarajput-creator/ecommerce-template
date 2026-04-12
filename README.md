# 🛒 TopMTop - Full Stack E-Commerce Website

A fully functional e-commerce website built with **React** (Frontend), **PHP** (Backend), and **MySQL** (Database). Complete with user authentication, product management, shopping cart, order processing, wishlist, reviews, and admin panel.

---

## 🛠️ Tech Stack

| Layer        | Technology                        |
|-------------|-----------------------------------|
| **Frontend** | React.js, React Router, Axios, React Icons, React Toastify |
| **Backend**  | PHP (7.4+), PDO                   |
| **Database** | MySQL                             |
| **Auth**     | JWT (custom implementation), bcrypt password hashing |
| **API**      | RESTful API (PHP)                 |

---

## 📸 Features

### 🛍️ Customer Features
- **User Registration & Login** - Secure JWT-based authentication
- **Product Browsing** - Browse products with search, category filter, sorting
- **Product Details** - Detailed view with images, ratings, reviews
- **Shopping Cart** - Add, update, remove products
- **Wishlist** - Save favorite products
- **Checkout** - Place orders (COD & Online)
- **Order Tracking** - View order history with status
- **User Profile** - Manage personal details
- **Responsive Design** - Mobile, tablet, desktop

### 👨‍💼 Admin Features
- **Dashboard** - Stats: total users, products, orders, revenue
- **Product Management** - Add, edit, delete with image upload
- **Order Management** - View & update order/payment status
- **User Management** - View all users
- **Category Management** - Manage product categories

---

## 📁 Project Structure

```
TopMTop/
├── frontend/                 # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/       # Navbar, Footer, Hero, ProductCard
│   │   ├── context/          # AuthContext, CartContext
│   │   ├── pages/            # Home, Products, Cart, Checkout, etc.
│   │   ├── utils/api.js      # Axios config
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── backend/                  # PHP Backend
│   ├── config/
│   │   ├── database.php      # MySQL PDO connection
│   │   ├── cors.php          # CORS headers
│   │   └── auth.php          # JWT functions
│   ├── api/
│   │   ├── auth.php          # Register, Login, Profile
│   │   ├── products.php      # Products CRUD
│   │   ├── categories.php    # Categories CRUD
│   │   ├── cart.php          # Cart operations
│   │   ├── orders.php        # Order placement & admin
│   │   ├── wishlist.php      # Wishlist operations
│   │   ├── reviews.php       # Product reviews
│   │   └── admin.php         # Admin dashboard
│   ├── uploads/              # Image uploads
│   ├── index.php             # API entry
│   └── .htaccess
│
├── database/
│   └── schema.sql            # MySQL schema with sample data
│
└── README.md
```

---

## 🚀 Installation & Setup

### Prerequisites
- **XAMPP / WAMP / LAMP** (Apache + PHP + MySQL)
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)

### Step 1: Clone the Repository

```bash
git clone https://github.com/rithalyarajput-creator/ecommerce-template.git
cd ecommerce-template
```

### Step 2: Setup Database

1. Start MySQL (via XAMPP / command line)
2. Open phpMyAdmin or MySQL CLI
3. Import the schema file:

```bash
mysql -u root -p < database/schema.sql
```

Or in phpMyAdmin: **Import** > Choose `database/schema.sql` > Go

This creates:
- Database `topmtop_db`
- All tables (users, products, categories, cart, orders, etc.)
- Sample categories and products
- Default admin user

### Step 3: Setup PHP Backend

1. Copy the `backend/` folder to your web server's document root:
   - **XAMPP:** `C:\xampp\htdocs\backend\`
   - **WAMP:** `C:\wamp64\www\backend\`
   - **LAMP:** `/var/www/html/backend/`

2. Edit database credentials in `backend/config/database.php`:

```php
private $host = "localhost";
private $db_name = "topmtop_db";
private $username = "root";
private $password = "";  // Your MySQL password
```

3. Make sure the `backend/uploads/` folder is writable:

```bash
chmod 777 backend/uploads
```

4. Make sure Apache's `mod_rewrite` is enabled (for `.htaccess`)

5. Test the API: Open `http://localhost/backend/` in browser - you should see JSON response.

### Step 4: Setup React Frontend

```bash
cd frontend
npm install
```

Create `.env` file in frontend folder:

```env
REACT_APP_API_URL=http://localhost/backend
```

Start the frontend:

```bash
npm start
```

Frontend runs on: `http://localhost:3000`

---

## 🔑 Default Login Credentials

### Admin Account
- **Email:** admin@topmtop.com
- **Password:** admin123

Login at `/login` and access the Admin Panel at `/admin`.

---

## 📡 API Endpoints

All PHP endpoints follow this pattern: `/api/{file}.php?action={action}`

### Authentication (`/api/auth.php`)
| Method | Action | Description |
|--------|--------|-------------|
| POST   | register | Register new user |
| POST   | login    | Login user |
| GET    | profile  | Get user profile (auth required) |
| PUT    | profile  | Update profile (auth required) |

### Products (`/api/products.php`)
| Method | Action | Description |
|--------|--------|-------------|
| GET    | list     | Get products (filter/search/sort/paginate) |
| GET    | featured | Get featured products |
| GET    | detail   | Get single product with reviews |
| POST   | create   | Add product (admin) |
| POST   | update   | Update product (admin) |
| DELETE | delete   | Delete product (admin) |

### Categories (`/api/categories.php`)
| Method | Action | Description |
|--------|--------|-------------|
| GET    | list   | Get all categories |
| POST   | create | Add category (admin) |
| DELETE | delete | Delete category (admin) |

### Cart (`/api/cart.php`) — Auth required
| Method | Action | Description |
|--------|--------|-------------|
| GET    | list   | Get cart items |
| POST   | add    | Add to cart |
| PUT    | update | Update quantity |
| DELETE | remove | Remove item |
| DELETE | clear  | Clear cart |

### Orders (`/api/orders.php`)
| Method | Action | Description |
|--------|--------|-------------|
| POST   | create         | Place order (auth) |
| GET    | my-orders      | Get user's orders (auth) |
| GET    | all            | Get all orders (admin) |
| PUT    | update-status  | Update order status (admin) |

### Wishlist (`/api/wishlist.php`) — Auth required
| Method | Action | Description |
|--------|--------|-------------|
| GET    | list   | Get wishlist |
| POST   | add    | Add to wishlist |
| DELETE | remove | Remove from wishlist |

### Reviews (`/api/reviews.php`)
| Method | Action | Description |
|--------|--------|-------------|
| POST   | add     | Add review (auth) |
| GET    | product | Get product reviews |

### Admin (`/api/admin.php`) — Admin only
| Method | Action | Description |
|--------|--------|-------------|
| GET    | dashboard   | Get dashboard stats |
| GET    | users       | Get all users |
| DELETE | delete-user | Delete user |

---

## 🗄️ Database Tables

| Table | Description |
|-------|-------------|
| `users` | User accounts (name, email, password, address, role) |
| `categories` | Product categories |
| `products` | Products (name, price, stock, rating, featured) |
| `cart` | User shopping cart items |
| `orders` | Orders with shipping & payment details |
| `order_items` | Items in each order |
| `reviews` | Product reviews with ratings |
| `wishlist` | User wishlist |

---

## 🎨 Design Theme

- **Primary Dark:** `#1a1a2e`
- **Secondary:** `#16213e`  
- **Accent:** `#e94560` (Red/Pink)
- **Blue:** `#0f3460`
- **Text Light:** `#ccd6f6`

Modern, clean design with dark navbar and light content areas. Fully responsive.

---

## 🔒 Security Features

- **Password Hashing** - PHP `password_hash()` (bcrypt)
- **JWT Authentication** - Custom JWT with 7-day expiry
- **Protected Routes** - Frontend route guards
- **Admin Authorization** - Separate admin middleware
- **File Validation** - Image-only uploads
- **SQL Injection Prevention** - PDO prepared statements
- **CORS Headers** - Configurable origin policy

---

## 🚀 Deployment

### Backend (PHP)
Deploy on any PHP hosting:
- **Shared Hosting** (Hostinger, GoDaddy, Bluehost)
- **VPS** (DigitalOcean, Linode, AWS EC2)
- Upload `backend/` folder via FTP/cPanel

### Frontend (React)
Build and deploy:
```bash
cd frontend
npm run build
```

Upload the `build/` folder to:
- **Netlify** (free)
- **Vercel** (free)
- **GitHub Pages**
- Or host on same server in a subfolder

### Database
- Use hosting's phpMyAdmin to import `schema.sql`
- Update `backend/config/database.php` with live credentials

---

## 👨‍💻 Author

**Rithalya Rajput**
- GitHub: [@rithalyarajput-creator](https://github.com/rithalyarajput-creator)
- Website: [rithalaupdate.wordpress.com](https://rithalaupdate.wordpress.com/)

---

## 📄 License

Open source under the [MIT License](LICENSE).

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
