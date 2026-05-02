-- Seller Support Migration
-- Run this after schema.sql to add seller functionality

USE topmtop_db;

-- Step 1: Update users role to include seller
ALTER TABLE users MODIFY COLUMN role ENUM('user', 'seller', 'admin') DEFAULT 'user';

-- Step 2: Add seller_id to products (NULL = admin-listed product)
ALTER TABLE products ADD COLUMN IF NOT EXISTS seller_id INT NULL DEFAULT NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS seller_approved TINYINT(1) DEFAULT 1;

-- Step 3: Seller profiles table
CREATE TABLE IF NOT EXISTS seller_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    shop_name VARCHAR(200) NOT NULL,
    shop_description TEXT,
    shop_logo VARCHAR(500),
    phone VARCHAR(20),
    whatsapp VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    gst_number VARCHAR(20),
    bank_account VARCHAR(50),
    ifsc_code VARCHAR(20),
    status ENUM('pending', 'approved', 'suspended') DEFAULT 'pending',
    total_products INT DEFAULT 0,
    total_orders INT DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Step 4: Seller order items mapping (to know which order item belongs to which seller)
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS seller_id INT NULL DEFAULT NULL;
