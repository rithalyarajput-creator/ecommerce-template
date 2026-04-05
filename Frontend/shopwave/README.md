# 🌊 ShopWave — React eCommerce SPA

A complete, production-ready eCommerce single-page application built with React.js.

## Tech Stack
- **React 18** (functional components + hooks)
- **React Router DOM v6** (client-side routing)
- **CSS Modules** (scoped styles per component)
- **Context API + useReducer** (global cart state)
- **localStorage** (cart persistence across sessions)

## Project Structure
```
src/
├── components/
│   ├── Navbar/         → Sticky navbar, search, cart badge, hamburger menu
│   ├── ProductCard/    → Reusable card (used on all pages)
│   ├── Banner/         → Hero banner with animations
│   └── Footer/         → Links + newsletter subscription
├── pages/
│   ├── Home/           → Full homepage with all sections
│   ├── Products/       → Filterable product listing
│   ├── ProductDetail/  → Single product page + similar products
│   └── Cart/           → Cart with order summary
├── context/
│   └── CartContext.js  → Global cart state (add/remove/update/clear)
└── data/
    └── products.js     → 16 dummy products across 4 categories
```

## Pages & Routes
| Route | Page |
|-------|------|
| `/` | Home |
| `/products` | All Products |
| `/products?category=Electronics` | Filtered by category |
| `/products?search=headphones` | Search results |
| `/products/:id` | Product Detail |
| `/cart` | Shopping Cart |

## Features
- ✅ 16 dummy products across 4 categories (Electronics, Fashion, Home & Kitchen, Fitness)
- ✅ Sticky navbar with live search dropdown
- ✅ Mobile hamburger menu
- ✅ Filter by category, price range, rating
- ✅ Sort by popularity, rating, price, newest
- ✅ Product detail with quantity selector
- ✅ Similar products horizontal scroll
- ✅ Cart with quantity controls + remove
- ✅ Order summary with shipping calculation
- ✅ Cart persists in localStorage
- ✅ Fully responsive (desktop, tablet, mobile)
- ✅ Wishlist heart toggle per card
- ✅ Discount badge, out-of-stock overlay
- ✅ Add-to-cart feedback animation

## Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm start
```

App runs at: **http://localhost:3000**

### Build for Production
```bash
npm run build
```

## API-Ready Structure
The data layer is designed for easy API migration:
```js
// Currently (dummy data):
const [products, setProducts] = useState(dummyProducts);

// Later with backend:
useEffect(() => {
  fetch('/api/products')
    .then(r => r.json())
    .then(setProducts);
}, []);
```

## Design System
- **Font**: Syne (display) + DM Sans (body)
- **Primary**: `#6C63FF`
- **Success**: `#22C55E`
- **Error/Sale**: `#EF4444`
- **Background**: `#F9FAFB`
- **Cards**: `#FFFFFF`
- **Spacing**: 8px grid system
- **Transitions**: 0.2s ease throughout

## Responsive Breakpoints
| Breakpoint | Layout |
|-----------|--------|
| 1200px+ | 4 columns (home), 3 columns (listing) |
| 1024px | 3 columns (home), 2 columns (listing) |
| 768px | 2 columns, hamburger menu |
| 480px | 1 column, mobile optimized |
