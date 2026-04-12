-- TopMTop E-Commerce Database Schema
-- Complete database with subcategories, multiple images, external links

CREATE DATABASE IF NOT EXISTS topmtop_db;
USE topmtop_db;

DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS wishlist;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS sub_subcategories;
DROP TABLE IF EXISTS subcategories;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- Users Table
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

-- Categories (Level 1)
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subcategories (Level 2)
CREATE TABLE subcategories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Sub-subcategories (Level 3)
CREATE TABLE sub_subcategories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subcategory_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE CASCADE
);

-- Products Table (with external links)
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description LONGTEXT,
    price DECIMAL(10, 2) NOT NULL,
    sale_price DECIMAL(10, 2),
    category_id INT,
    subcategory_id INT,
    sub_subcategory_id INT,
    image VARCHAR(500),
    stock INT DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0,
    num_reviews INT DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    brand VARCHAR(100),
    meesho_link VARCHAR(1000),
    flipkart_link VARCHAR(1000),
    amazon_link VARCHAR(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE SET NULL,
    FOREIGN KEY (sub_subcategory_id) REFERENCES sub_subcategories(id) ON DELETE SET NULL
);

-- Product Images (multiple images per product)
CREATE TABLE product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    sort_order INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Cart
CREATE TABLE cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Orders
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

-- ===============================
-- Default Admin (password: admin123)
-- ===============================
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@topmtop.com', '$2y$10$LqtASLndnG83iwecenhFt.eFktDdt6S.Nb5fAwSapr33STXVMbsVu', 'admin');

-- ===============================
-- Categories - Only Jewellery for now
-- ===============================
INSERT INTO categories (id, name, description, image) VALUES
(1, 'Jewellery', 'Traditional and modern Indian jewellery for all occasions', '/uploads/products/p1_1.png');

-- ===============================
-- Subcategories under Jewellery
-- ===============================
INSERT INTO subcategories (id, category_id, name, description, image) VALUES
(1, 1, 'Necklace', 'Beautiful necklaces including chokers, long necklaces, and sets', '/uploads/products/p1_1.png'),
(2, 1, 'Earrings', 'Jhumka, studs, danglers and more', '/uploads/products/p1_1.png'),
(3, 1, 'Mangalsutra', 'Traditional mangalsutra designs', '/uploads/products/p6_1.png'),
(4, 1, 'Bridal Sets', 'Complete bridal jewellery sets', '/uploads/products/p7_1.png');

-- ===============================
-- Sub-subcategories
-- ===============================
INSERT INTO sub_subcategories (id, subcategory_id, name, description) VALUES
(1, 1, 'Kundan Necklace', 'Traditional kundan style necklaces'),
(2, 1, 'Temple Jewellery', 'Antique temple-inspired designs'),
(3, 1, 'Zircon/Diamond', 'American diamond and zircon necklaces'),
(4, 1, 'Enamel/Meenakari', 'Meenakari and enamel painted jewellery'),
(5, 3, 'Traditional Mangalsutra', 'Classic mangalsutra designs'),
(6, 4, 'Wedding Set', 'Complete bridal jewellery sets');

-- ===============================
-- 7 Amshine Jewellery Products
-- ===============================
INSERT INTO products (id, name, description, price, sale_price, category_id, subcategory_id, sub_subcategory_id, image, stock, rating, num_reviews, featured, brand, meesho_link, flipkart_link, amazon_link) VALUES

(1, 'Amshine Gold Plated Kundan Jhumka Necklace Set with Red & Green Stones',
'Traditional jewellery has always been an important part of Indian fashion and culture. Among the most admired styles are kundan necklace sets, known for their intricate craftsmanship and timeless appeal. The Amshine Gold Plated Kundan Necklace Set is crafted to combine traditional Indian craftsmanship with a refined and stylish look, making it a perfect accessory for festive occasions, weddings, and cultural celebrations.\n\nThis necklace set is designed to complement a wide range of ethnic outfits such as sarees, lehengas, and salwar suits. With detailed stone work and a classic temple-style structure, it adds sophistication and elegance to any traditional look.\n\nTraditional Design with Elegant Craftsmanship\nThe necklace features an intricate floral pattern with a beautifully detailed central pendant. The carefully placed red and green kundan stones create a balanced and graceful appearance that works perfectly with both traditional and modern ethnic fashion.\n\nPremium Stone and Kundan Detailing\nDecorated with kundan-style stones along with green and ruby colored accents. The combination of these stones adds depth and visual appeal to the design. The gold-plated finish further enhances the luxurious look.\n\nPerfect for Weddings and Festive Occasions\nThis necklace set is popular for weddings, festivals, and traditional events. It can be paired with sarees, lehengas, anarkalis, or other traditional dresses.\n\nProduct Highlights\n• Elegant traditional kundan necklace design\n• Gold plated finish for a luxurious appearance\n• Red and green colored stone detailing\n• Matching jhumka earrings included\n• Suitable for weddings, festivals, and special occasions\n• Lightweight design for comfortable wear\n\nCare Instructions\n• Store in a dry and clean jewellery box\n• Avoid direct contact with water, perfume, and chemicals\n• Wipe gently with a soft cloth after use\n• Keep separate from other jewellery to prevent scratches',
899.00, 499.00, 1, 1, 1, '/uploads/products/p1_1.png', 50, 4.7, 342, TRUE, 'Amshine', 'https://meesho.com', 'https://flipkart.com', 'https://amazon.in'),

(2, 'Amshine Silver Plated Double Layer Zircon Necklace Set with Teardrop Pendants',
'Elegant and modern, the Amshine Silver Plated Double Layer Zircon Necklace Set brings glamour and grace together. Designed with two delicate layers of sparkling stones and beautiful teardrop pendants, this set is perfect for parties, cocktails, and special events.\n\nContemporary Design for Modern Women\nThe two-layer design creates a stunning visual effect, making this necklace ideal for Western wear, gowns, and evening outfits. The matching earrings complete the look with elegance.\n\nPremium American Diamond Quality\nThe necklace features premium quality zircon (American diamond) stones that shine beautifully under any lighting. The silver-plated finish ensures durability and a clean, classy appearance.\n\nPerfect for Special Occasions\n• Parties and get-togethers\n• Engagement ceremonies\n• Reception events\n• Cocktail evenings\n• Anniversary celebrations\n\nProduct Highlights\n• Double layer necklace design\n• Premium zircon stones throughout\n• Teardrop pendants for added elegance\n• Silver plated finish\n• Lightweight and comfortable\n• Perfect for Indo-western and Western outfits\n\nCare Instructions\n• Store in a dry, clean jewellery box\n• Avoid water, perfume, and chemicals\n• Clean with a soft cloth after each use\n• Keep separately from other jewellery',
799.00, 449.00, 1, 1, 3, '/uploads/products/p2_1.png', 45, 4.6, 256, TRUE, 'Amshine', 'https://meesho.com', 'https://flipkart.com', 'https://amazon.in'),

(3, 'Amshine Lotus Meenakari Enamel Necklace Set with Matching Earrings',
'Handcrafted with love, the Amshine Lotus Meenakari Enamel Necklace Set celebrates the rich art of Indian meenakari. Each lotus motif is carefully painted in vibrant red enamel with green accents, creating a striking contrast against the gold-toned chain.\n\nTraditional Indian Art\nMeenakari is an ancient Indian craft of coloring the surfaces of metals with vibrant enamel paint. This necklace showcases the beautiful lotus flower, symbolizing purity and beauty.\n\nUnique and Eye-Catching Design\nThe lotus pattern repeats along the necklace, creating a statement piece that stands out from ordinary jewellery. The matching stud earrings complete the ethnic look.\n\nPerfect for Traditional Events\n• Festivals like Diwali, Karva Chauth\n• Traditional pujas and rituals\n• Ethnic parties and gatherings\n• Temple visits\n• Cultural celebrations\n\nProduct Highlights\n• Handcrafted lotus meenakari design\n• Vibrant red and green enamel work\n• Gold-toned chain and base\n• Matching lotus stud earrings\n• Traditional yet trendy look\n• Suitable for all age groups\n\nCare Instructions\n• Store in a soft cloth pouch\n• Avoid water and sweat contact\n• Wipe gently with dry cloth\n• Handle enamel area with care',
699.00, 379.00, 1, 1, 4, '/uploads/products/p3_1.png', 60, 4.8, 423, TRUE, 'Amshine', 'https://meesho.com', 'https://flipkart.com', 'https://amazon.in'),

(4, 'Amshine Antique Gold Temple Necklace Set with Pearl Drops & Jhumka',
'Inspired by the rich heritage of South Indian temple jewellery, the Amshine Antique Gold Temple Necklace Set is a stunning piece that brings royal elegance to any outfit. The intricate detailing with pearl drops and matching jhumka earrings makes it a perfect choice for weddings and traditional ceremonies.\n\nRoyal Temple Design\nThe necklace features traditional South Indian temple motifs with floral patterns and small stones. The antique gold finish gives it an authentic vintage look that is highly prized in Indian jewellery.\n\nElegant Pearl Detailing\nPearl drops hang gracefully from the necklace, adding movement and charm. The pearls also appear in the matching jhumka earrings, creating a cohesive traditional look.\n\nPerfect for Weddings & Traditional Events\n• Bridal wear (as secondary jewellery)\n• Wedding functions\n• Traditional South Indian events\n• Classical dance performances\n• Temple visits\n\nProduct Highlights\n• Antique gold plated finish\n• South Indian temple-style design\n• Pearl drops throughout\n• Traditional floral motifs\n• Matching pearl jhumka earrings\n• Adjustable thread closure\n• Lightweight and comfortable\n\nCare Instructions\n• Store in a dry jewellery box\n• Avoid contact with moisture and chemicals\n• Clean gently with soft dry cloth\n• Keep pearls away from perfume',
949.00, 599.00, 1, 1, 2, '/uploads/products/p4_1.png', 35, 4.9, 189, TRUE, 'Amshine', 'https://meesho.com', 'https://flipkart.com', 'https://amazon.in'),

(5, 'Amshine Silver Plated Bridal Zircon Leaf Necklace Set',
'Designed for the modern bride, the Amshine Silver Plated Bridal Zircon Leaf Necklace Set is a masterpiece of delicate design and sparkling beauty. The leaf-inspired pattern with premium zircon stones creates a sophisticated look perfect for bridal and special occasions.\n\nDelicate Leaf-Inspired Design\nThe intricate leaf pattern creates a natural, flowing design that wraps gracefully around the neck. Each zircon stone is carefully set to catch and reflect light beautifully.\n\nPremium Quality Zircon Stones\nThe necklace features high-quality zircon (American diamond) stones that rival the shine of real diamonds. The silver-plated finish ensures a pristine white appearance.\n\nPerfect for Bridal Wear\n• Reception and sangeet events\n• Engagement ceremonies\n• Wedding photography\n• Cocktail parties\n• Anniversary celebrations\n\nProduct Highlights\n• Delicate leaf design pattern\n• Premium zircon stone detailing\n• Silver plated finish\n• Matching earrings included\n• Lightweight and elegant\n• Perfect for reception and parties\n• Goes well with gowns and lehengas\n\nCare Instructions\n• Store in a velvet pouch\n• Avoid chemicals and perfume\n• Clean with soft cloth\n• Keep in dry place',
1099.00, 649.00, 1, 4, 6, '/uploads/products/p5_1.png', 25, 4.8, 178, TRUE, 'Amshine', 'https://meesho.com', 'https://flipkart.com', 'https://amazon.in'),

(6, 'Amshine Traditional Gold Plated Mangalsutra with Crystal Pendant',
'The Amshine Traditional Gold Plated Mangalsutra is a beautiful piece of bridal jewellery that symbolizes love, commitment, and marriage. Crafted with attention to detail, this mangalsutra features a delicate fan-shaped pendant with a clear crystal centerpiece.\n\nSymbol of Sacred Marriage\nThe mangalsutra holds deep cultural significance in Indian marriages, representing the sacred bond between husband and wife. This piece combines tradition with contemporary elegance.\n\nElegant Pendant Design\nThe fan-shaped pendant with intricate goldwork and a shining crystal at the center creates a stunning focal point. The traditional black and gold beaded chain adds authenticity.\n\nPerfect for Daily Wear & Special Occasions\n• Everyday wear by married women\n• Wedding ceremonies\n• Religious festivals\n• Anniversary celebrations\n• Traditional gatherings\n\nProduct Highlights\n• Traditional black and gold bead chain\n• Fan-shaped gold plated pendant\n• Clear crystal centerpiece\n• Lightweight for daily wear\n• Secure clasp closure\n• Symbol of marriage\n• Suitable for all age groups\n\nCare Instructions\n• Remove before bathing\n• Avoid perfume and chemicals\n• Clean with soft cloth\n• Store separately to avoid tangling',
599.00, 299.00, 1, 3, 5, '/uploads/products/p6_1.png', 80, 4.7, 567, FALSE, 'Amshine', 'https://meesho.com', 'https://flipkart.com', 'https://amazon.in'),

(7, 'Amshine Gold Plated Bridal Zircon Necklace Set with Maang Tikka',
'Complete your bridal look with the Amshine Gold Plated Bridal Zircon Necklace Set featuring matching earrings and maang tikka. This stunning 3-piece set is designed for brides who want to make a statement on their special day.\n\nComplete Bridal Set\nThis set includes everything needed for a traditional bridal look - a statement necklace, matching earrings, and a maang tikka for the forehead. All pieces feature coordinated design elements.\n\nSparkling Round Zircon Stones\nLarge round zircon stones are the highlight of this set, each surrounded by intricate gold detailing. The stones sparkle beautifully, creating a royal look worthy of any bride.\n\nPerfect for Wedding Day\n• Main wedding ceremony\n• Reception events\n• Bridal photography\n• Engagement party\n• Sangeet ceremony\n\nProduct Highlights\n• 3-piece complete bridal set (Necklace + Earrings + Maang Tikka)\n• Large round zircon stones\n• Gold plated finish\n• Traditional yet stunning design\n• Adjustable closure\n• Perfect for wedding day\n• Statement jewellery piece\n\nCare Instructions\n• Store in bridal jewellery box\n• Handle with care\n• Avoid water and chemicals\n• Use soft cloth to clean\n• Store each piece separately',
1299.00, 749.00, 1, 4, 6, '/uploads/products/p7_1.png', 20, 4.9, 134, TRUE, 'Amshine', 'https://meesho.com', 'https://flipkart.com', 'https://amazon.in');

-- ===============================
-- Product Images (Multiple per product)
-- ===============================
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
(1, '/uploads/products/p1_1.png', 0), (1, '/uploads/products/p1_2.png', 1), (1, '/uploads/products/p1_3.png', 2), (1, '/uploads/products/p1_4.png', 3),
(2, '/uploads/products/p2_1.png', 0), (2, '/uploads/products/p2_2.png', 1), (2, '/uploads/products/p2_3.png', 2), (2, '/uploads/products/p2_4.png', 3),
(3, '/uploads/products/p3_1.png', 0), (3, '/uploads/products/p3_2.png', 1), (3, '/uploads/products/p3_3.png', 2), (3, '/uploads/products/p3_4.png', 3),
(4, '/uploads/products/p4_1.png', 0), (4, '/uploads/products/p4_2.png', 1), (4, '/uploads/products/p4_3.png', 2), (4, '/uploads/products/p4_4.png', 3),
(5, '/uploads/products/p5_1.png', 0), (5, '/uploads/products/p5_2.png', 1), (5, '/uploads/products/p5_3.png', 2), (5, '/uploads/products/p5_4.png', 3),
(6, '/uploads/products/p6_1.png', 0), (6, '/uploads/products/p6_2.png', 1), (6, '/uploads/products/p6_3.png', 2), (6, '/uploads/products/p6_4.png', 3),
(7, '/uploads/products/p7_1.png', 0), (7, '/uploads/products/p7_2.png', 1), (7, '/uploads/products/p7_3.png', 2), (7, '/uploads/products/p7_4.png', 3);
