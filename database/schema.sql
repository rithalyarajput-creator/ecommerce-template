-- TopMTop E-Commerce Database Schema
CREATE DATABASE IF NOT EXISTS topmtop_db;
USE topmtop_db;

DROP TABLE IF EXISTS wishlist;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    sale_price DECIMAL(10, 2),
    category_id INT,
    image VARCHAR(500),
    stock INT DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0,
    num_reviews INT DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    brand VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    shipping_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    payment_method ENUM('cod', 'online') DEFAULT 'cod',
    payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
    order_status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_wishlist (user_id, product_id)
);

-- Default Admin (password: admin123)
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@topmtop.com', '$2y$10$LqtASLndnG83iwecenhFt.eFktDdt6S.Nb5fAwSapr33STXVMbsVu', 'admin');

-- Categories with images
INSERT INTO categories (name, description, image) VALUES
('Electronics', 'Latest electronic gadgets and devices', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400'),
('Fashion', 'Trendy clothing and accessories', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400'),
('Home & Kitchen', 'Home decor and kitchen essentials', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400'),
('Mobiles', 'Latest smartphones and accessories', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'),
('Beauty', 'Beauty and personal care', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400'),
('Sports', 'Sports and fitness equipment', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400'),
('Books', 'Best selling books', 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400'),
('Appliances', 'Home appliances', 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400');

-- 24 Products with real image URLs
INSERT INTO products (name, description, price, sale_price, category_id, image, stock, rating, num_reviews, featured, brand) VALUES
('Apple iPhone 15 Pro Max 256GB', 'Titanium design, A17 Pro chip, 48MP Pro camera system, ProMotion display', 159900.00, 139900.00, 4, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600', 25, 4.8, 2547, TRUE, 'Apple'),
('Samsung Galaxy S24 Ultra', '6.8 inch Dynamic AMOLED 2X, 200MP camera, S Pen, 5000mAh battery', 129999.00, 109999.00, 4, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600', 40, 4.7, 1832, TRUE, 'Samsung'),
('Sony WH-1000XM5 Wireless Headphones', 'Industry-leading noise cancellation, 30hr battery, crystal clear hands-free calling', 34990.00, 24990.00, 1, 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600', 50, 4.6, 3421, TRUE, 'Sony'),
('Apple MacBook Air M2 13.6 inch', 'Apple M2 chip, 8GB RAM, 256GB SSD, Liquid Retina display, 18hr battery', 114900.00, 99900.00, 1, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600', 15, 4.9, 876, TRUE, 'Apple'),
('Noise ColorFit Pro 4 Smart Watch', '1.85 inch display, Bluetooth calling, 100+ sports modes, SpO2, 7-day battery', 3999.00, 1999.00, 1, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600', 120, 4.3, 5632, TRUE, 'Noise'),
('Nike Air Max 270 Running Shoes', 'Mens running shoes with Max Air unit, breathable mesh, lightweight design', 12995.00, 8995.00, 2, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', 80, 4.5, 2103, TRUE, 'Nike'),
('Levis 511 Slim Fit Mens Jeans', 'Classic slim fit, 5-pocket styling, cotton blend fabric, zip fly closure', 3499.00, 1749.00, 2, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600', 200, 4.2, 1456, FALSE, 'Levis'),
('Fabindia Cotton Kurti for Women', 'Elegant embroidered cotton kurti, round neck, 3/4 sleeve, knee length', 1999.00, 1299.00, 2, 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600', 150, 4.4, 876, TRUE, 'Fabindia'),
('LG 1.5 Ton 5 Star Split AC', 'Dual Inverter, Convertible 6-in-1 Cooling, HD Filter with Anti-Virus Protection', 55990.00, 39990.00, 8, 'https://images.unsplash.com/photo-1631545308456-19a60f5bf53a?w=600', 20, 4.5, 432, TRUE, 'LG'),
('Samsung 253L Double Door Refrigerator', 'Frost Free, Digital Inverter, Convertible 5-in-1, 10 Year Warranty', 32990.00, 24990.00, 8, 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600', 30, 4.4, 654, FALSE, 'Samsung'),
('Prestige Nakshatra Plus Induction Cooktop', '1900W, 7 preset menus, feather touch buttons, auto voltage regulator', 4595.00, 2495.00, 3, 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600', 100, 4.3, 1234, FALSE, 'Prestige'),
('Hawkins Contura Hard Anodised Pressure Cooker 5L', 'Black color, flat bottom, 5-year warranty, ISI certified', 3175.00, 2245.00, 3, 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600', 75, 4.6, 987, FALSE, 'Hawkins'),
('Lakme 9 to 5 Primer + Matte Powder Foundation', 'Long lasting, matte finish, all-day coverage, SPF 20, natural beige', 625.00, 450.00, 5, 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600', 300, 4.2, 2134, FALSE, 'Lakme'),
('Mamaearth Vitamin C Face Wash', 'With Vitamin C and Turmeric for skin illumination, 100ml, no sulfates', 399.00, 279.00, 5, 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600', 500, 4.5, 8762, TRUE, 'Mamaearth'),
('boAt Airdopes 141 Bluetooth Earbuds', '42H playtime, IWP technology, IPX4 water resistance, Bluetooth v5.1', 1499.00, 999.00, 1, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600', 400, 4.1, 15623, TRUE, 'boAt'),
('Cosco Volleyball Official Size 4', 'Synthetic rubber, 18 panel hand stitched, for indoor and outdoor', 699.00, 449.00, 6, 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=600', 60, 4.0, 234, FALSE, 'Cosco'),
('Yonex Mavis 350 Nylon Shuttlecock (Pack of 6)', 'Professional grade, consistent flight, durable nylon feathers, white', 899.00, 649.00, 6, 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600', 150, 4.4, 543, FALSE, 'Yonex'),
('Atomic Habits by James Clear', 'Tiny Changes, Remarkable Results - International Bestseller, Paperback', 799.00, 399.00, 7, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600', 200, 4.8, 12543, TRUE, 'Random House'),
('Philips HD9200/90 Air Fryer', '4.1L, Rapid Air Technology, 80% less oil, QuickClean basket, digital display', 12995.00, 7995.00, 8, 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600', 45, 4.5, 1876, TRUE, 'Philips'),
('Bajaj Majesty RX-11 Rice Cooker', '1.8 Litre, 700W, automatic cooking, keep warm function, 2 year warranty', 2299.00, 1499.00, 8, 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600', 85, 4.2, 654, FALSE, 'Bajaj'),
('Realme Narzo 70 Pro 5G 128GB', 'Dimensity 7050, 120Hz AMOLED, 5000mAh, 67W fast charging', 19999.00, 17999.00, 4, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600', 100, 4.3, 3456, FALSE, 'Realme'),
('Dell Inspiron 15 3520 Laptop', 'Intel i5 12th gen, 8GB RAM, 512GB SSD, 15.6 inch FHD, Windows 11', 52990.00, 42990.00, 1, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600', 25, 4.4, 987, FALSE, 'Dell'),
('Puma Softride Rift Running Shoes', 'SoftRide technology, Premium cushioning, Running shoes for men', 5499.00, 2749.00, 6, 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600', 90, 4.3, 654, FALSE, 'Puma'),
('Amazon Echo Dot 5th Gen', 'Smart speaker with Alexa, Bigger vibrant sound, Tap to snooze, Charcoal', 5499.00, 3499.00, 1, 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=600', 150, 4.6, 4532, TRUE, 'Amazon');
