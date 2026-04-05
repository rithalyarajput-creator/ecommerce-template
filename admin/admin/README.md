# AdminX – eCommerce Admin Panel

A complete, production-ready React admin panel for an eCommerce platform.

## 🚀 Quick Start

```bash
cd admin
npm install
npm start
```

Runs on **http://localhost:3001**

> Make sure your backend API is running on **http://localhost:5000**

---

## 🛠 Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 | UI framework |
| React Router DOM v6 | Navigation & routing |
| Axios | API requests |
| React Context API | Auth state management |
| CSS Modules | Scoped styling |
| Recharts | Dashboard charts |

---

## 📁 Project Structure

```
src/
├── api/
│   └── axios.js            → Axios instance (base URL + JWT interceptor)
├── components/
│   ├── Sidebar/            → Left navigation (fixed, mobile-collapsible)
│   ├── Navbar/             → Top bar with page title + profile
│   ├── Table/              → Reusable data table
│   ├── Modal/              → Reusable modal / dialog
│   ├── ImageUpload/        → Drag & drop image uploader
│   ├── StatsCard/          → Dashboard KPI cards
│   ├── Pagination/         → Page controls
│   ├── ConfirmDialog/      → Delete confirmation popup
│   └── Toast/              → Toast notification system
├── context/
│   └── AuthContext.js      → Admin login state + JWT storage
├── pages/
│   ├── Login/              → Admin login screen
│   ├── Dashboard/          → Overview: stats, charts, recent orders
│   ├── Products/           → CRUD products with image upload
│   ├── Orders/             → Order listing + status updates
│   ├── Customers/          → Customer list + order history
│   ├── Categories/         → Category grid management
│   └── Settings/           → Store config + theme editor
└── App.js                  → Routes + protected route wrapper
```

---

## 🔐 Authentication

- Login via `POST /api/auth/login`
- JWT stored in `localStorage` as `adminToken`
- All API requests auto-attach `Authorization: Bearer <token>`
- Role check: `user.role === 'admin'` enforced on login
- Expired/invalid tokens auto-redirect to `/login`
- All routes except `/login` are protected

---

## 📄 Pages & API Endpoints

### Dashboard `/dashboard`
- `GET /api/dashboard/stats` – revenue, orders, products, customers totals
- `GET /api/orders?limit=5&sort=-createdAt` – recent orders
- `GET /api/products?limit=5&sort=-soldCount` – top products
- Line chart (revenue) + Bar chart (orders) for last 7 days

### Products `/products`
- `GET /api/products` – paginated, searchable, filterable
- `POST /api/products` – create product
- `PUT /api/products/:id` – update product
- `DELETE /api/products/:id` – delete product
- `POST /api/products/:id/upload` – upload product images (multipart)

### Orders `/orders`
- `GET /api/orders` – paginated, search by ID/customer, filter by status
- `PUT /api/orders/:id/status` – update order status

### Customers `/customers`
- `GET /api/users` – paginated user list
- `GET /api/orders?user=:id` – customer order history

### Categories `/categories`
- `GET /api/categories` – all categories
- `POST /api/categories` – create (multipart with image)
- `PUT /api/categories/:id` – update
- `DELETE /api/categories/:id` – delete

### Settings `/settings`
- `GET /api/settings` – load settings
- `PUT /api/settings` – save settings (multipart with logo)
- Also persisted to `localStorage` as `storeSettings`

---

## 🎨 Design System

```css
--primary:     #6C63FF   /* Accent / active state */
--sidebar-bg:  #1E1E2D   /* Dark sidebar background */
--content-bg:  #F4F6F9   /* Page background */
--card-bg:     #FFFFFF   /* Card surfaces */
--text-dark:   #1A1A2E   /* Primary text */
--text-muted:  #6B7280   /* Secondary text */
```

Font: **Plus Jakarta Sans** (Google Fonts)

---

## 📱 Responsive Behaviour

| Breakpoint | Behaviour |
|-----------|-----------|
| Desktop (>768px) | Sidebar always visible (fixed 250px) |
| Mobile (≤768px)  | Sidebar hidden; hamburger opens overlay |

---

## 🔔 Toast Notifications

Use the `useToast()` hook anywhere:

```js
const { addToast } = useToast();
addToast('Product saved!', 'success');   // green
addToast('Something went wrong', 'error'); // red
addToast('Info message', 'info');          // blue
```

---

## ⚙️ Environment

| Service | Port |
|---------|------|
| Admin Panel (this app) | `3001` |
| Main Frontend | `3000` |
| Backend API | `5000` |

To change the API base URL, edit `src/api/axios.js`:
```js
baseURL: 'http://localhost:5000/api'
```
