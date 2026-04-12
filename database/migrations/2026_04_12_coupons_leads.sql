-- Migration: Coupons, Leads, Order enhancements
-- Safe to run multiple times (uses IF NOT EXISTS)

USE topmtop_db;

-- Coupons
CREATE TABLE IF NOT EXISTS coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    discount_type ENUM('percent', 'flat') DEFAULT 'percent',
    discount_value DECIMAL(10, 2) NOT NULL,
    min_order_amount DECIMAL(10, 2) DEFAULT 0,
    max_discount DECIMAL(10, 2) DEFAULT NULL,
    usage_limit INT DEFAULT NULL,
    used_count INT DEFAULT 0,
    valid_from DATE DEFAULT NULL,
    valid_until DATE DEFAULT NULL,
    active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leads
CREATE TABLE IF NOT EXISTS leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(30),
    source VARCHAR(60) DEFAULT 'contact',
    product_id INT DEFAULT NULL,
    product_name VARCHAR(255) DEFAULT NULL,
    message TEXT,
    status ENUM('new', 'contacted', 'qualified', 'converted', 'closed') DEFAULT 'new',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Product draft flag & analytics columns (add only if missing)
-- MySQL does not support ADD COLUMN IF NOT EXISTS in all versions, so we guard
SET @have_draft := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'products' AND column_name = 'draft');
SET @sql := IF(@have_draft = 0, 'ALTER TABLE products ADD COLUMN draft TINYINT(1) DEFAULT 0', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Orders: add coupon + discount tracking
SET @have_coupon := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'orders' AND column_name = 'coupon_code');
SET @sql := IF(@have_coupon = 0, 'ALTER TABLE orders ADD COLUMN coupon_code VARCHAR(50) DEFAULT NULL, ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0, ADD COLUMN subtotal DECIMAL(10,2) DEFAULT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Sample coupons (only insert if table is empty)
INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount, active)
SELECT * FROM (SELECT 'WELCOME10' as code, '10% off on your first order' as d, 'percent' as t, 10 as v, 500 as m, 500 as md, 1 as a) tmp
WHERE NOT EXISTS (SELECT 1 FROM coupons LIMIT 1);

INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, active)
SELECT 'FLAT200', 'Flat Rs.200 off on orders above Rs.1500', 'flat', 200, 1500, 1
WHERE NOT EXISTS (SELECT 1 FROM coupons WHERE code = 'FLAT200');

INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount, active)
SELECT 'JEWEL15', '15% off on jewellery (max Rs.1000)', 'percent', 15, 1000, 1000, 1
WHERE NOT EXISTS (SELECT 1 FROM coupons WHERE code = 'JEWEL15');
