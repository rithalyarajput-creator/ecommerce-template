const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

// Route imports
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const couponRoutes = require("./routes/couponRoutes");
const leadRoutes = require("./routes/leadRoutes");
const faqRoutes = require("./routes/faqRoutes");
const userRoutes = require("./routes/userRoutes");
const scrapeRoutes = require("./routes/scrapeRoutes");
const testimonialRoutes = require("./routes/testimonialRoutes");

// Connect to MongoDB
connectDB();

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: true,        // Allow ALL origins (including Codespaces URLs)
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files as static assets
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Routes ────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/users", userRoutes);
app.use("/api/scrape", scrapeRoutes);
app.use("/api/testimonials", testimonialRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Ecommerce API is running!",
    endpoints: {
      health: "/api/health",
      products: "/api/products",
      categories: "/api/categories",
      auth: "/api/auth",
      orders: "/api/orders",
      coupons: "/api/coupons",
      leads: "/api/leads",
    },
  });
});

// ── Start server ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
