-- Product Variations Migration
-- Run this in phpMyAdmin on topmtop_db

USE topmtop_db;

CREATE TABLE IF NOT EXISTS product_variations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    attribute_name VARCHAR(50) NOT NULL,  -- e.g. "Color", "Size", "Material"
    attribute_value VARCHAR(100) NOT NULL, -- e.g. "Red", "XL", "Gold"
    price DECIMAL(10,2) DEFAULT NULL,      -- override product price if set
    stock INT DEFAULT 0,
    image VARCHAR(255) DEFAULT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
