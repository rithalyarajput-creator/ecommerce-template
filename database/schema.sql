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
-- Add Bracelet subcategory and 12 new products (6 earrings + 6 bracelets)


-- Add Bracelet subcategory (id 5)
INSERT INTO subcategories (id, category_id, name, description, image) VALUES
(5, 1, 'Bracelet', 'Elegant bracelets and bangles for women', '/uploads/products/b1_1.png');

-- Add sub-subcategories for Earrings and Bracelets
INSERT INTO sub_subcategories (subcategory_id, name, description) VALUES
(2, 'Chandbali', 'Traditional chandbali style earrings'),
(2, 'Jhumka', 'Classic jhumka earrings'),
(2, 'Party Wear', 'Stylish party wear earrings'),
(5, 'Kada Bangle', 'Traditional kada style bangles'),
(5, 'Cuff Bracelet', 'Modern cuff bracelets'),
(5, 'Flower Bracelet', 'Floral design bracelets');

-- ===============================
-- 6 EARRINGS
-- ===============================
INSERT INTO products (name, description, price, sale_price, category_id, subcategory_id, sub_subcategory_id, image, stock, rating, num_reviews, featured, brand, meesho_link, flipkart_link, amazon_link) VALUES

('Gold Plated Kundan Chandbali Earrings with Pearl Drops',
'Beautifully crafted kundan chandbali earrings featuring intricate stone work and hanging pearl drops. These traditional earrings are perfect for weddings, receptions, and festive occasions.\n\nTraditional Chandbali Design\nThe iconic chandbali shape is inspired by the crescent moon, a classic motif in Indian jewellery. Each earring features dome-shaped structures with detailed kundan work.\n\nPearl Drop Embellishments\nDelicate pearl drops hang from the bottom of each earring, adding movement and elegance. The pearls create a graceful contrast with the gold-plated base.\n\nPerfect for Special Occasions\n• Wedding ceremonies\n• Reception parties\n• Sangeet functions\n• Festival celebrations\n• Traditional events\n\nProduct Highlights\n• Gold plated finish\n• Kundan stone detailing\n• Multiple pearl drops\n• Traditional chandbali design\n• Secure back closure\n• Lightweight for comfortable wear\n\nCare Instructions\n• Store in jewellery box\n• Avoid water and perfume contact\n• Wipe with soft dry cloth\n• Keep separate from other jewellery',
599.00, 299.00, 1, 2, 7, '/uploads/products/e1_1.png', 80, 4.7, 312, TRUE, 'Amshine', 'https://meesho.com', 'https://flipkart.com', 'https://amazon.in'),

('Silver Oxidized Floral Jhumka Earrings with Hanging Bells',
'Stunning silver oxidized earrings featuring a beautiful circular floral design with multiple small hanging jhumkas and bells. The vintage-inspired look makes these perfect for Indo-western and ethnic outfits.\n\nOxidized Silver Finish\nThe oxidized silver finish gives these earrings a vintage antique look that pairs beautifully with both traditional and fusion wear.\n\nMultiple Jhumka Drops\nEach earring features multiple mini jhumkas hanging from the circular base, creating movement and sound with every step.\n\nPerfect for Fusion Wear\n• Casual ethnic outings\n• Office wear with kurtis\n• Festivals and small events\n• Instagram photoshoots\n• College functions\n\nProduct Highlights\n• Silver oxidized finish\n• Circular floral design\n• Multiple hanging jhumkas\n• Large statement size\n• Hypoallergenic\n• Push-back closure\n\nCare Instructions\n• Keep in airtight pouch to prevent tarnishing\n• Avoid moisture\n• Clean with silver polish cloth\n• Do not use chemical cleaners',
449.00, 249.00, 1, 2, 8, '/uploads/products/e2_1.png', 100, 4.5, 523, TRUE, 'Amshine', 'https://meesho.com', 'https://flipkart.com', 'https://amazon.in'),

('Antique Gold Temple Chandbali Earrings with Red & Green Stones',
'Exquisite antique gold chandbali earrings with traditional temple-inspired motifs and colorful stones. Features pearl beading at the bottom for added elegance.\n\nAntique Gold Finish\nThe antique gold plating gives these earrings a rich heritage look, perfect for traditional South Indian and North Indian bridal attire.\n\nColorful Stone Work\nRed and green kundan stones are set in intricate patterns, creating a vibrant and regal appearance suitable for all festive occasions.\n\nPerfect for Weddings\n• Bridal wear\n• Wedding ceremonies\n• Sangeet and mehendi\n• Festival celebrations\n• Traditional photoshoots\n\nProduct Highlights\n• Antique gold plated finish\n• Red and green colored stones\n• Temple-inspired design\n• Pearl bead embellishments\n• Large chandbali shape\n• Pierced ear style\n\nCare Instructions\n• Store in dry jewellery box\n• Handle stone area carefully\n• Avoid perfume and chemicals\n• Clean with soft microfiber cloth',
649.00, 379.00, 1, 2, 7, '/uploads/products/e3_1.png', 60, 4.8, 267, TRUE, 'Amshine', 'https://meesho.com', 'https://flipkart.com', 'https://amazon.in'),

('Oxidized Gold Victorian Jhumka Earrings with Ruby Green Stones',
'Classic jhumka earrings with a Victorian-inspired design featuring dome-shaped drops and vibrant ruby red and emerald green stones. The traditional kundan stud top adds to the regal appeal.\n\nClassic Jhumka Structure\nThe iconic dome-shaped jhumka with carved detailing is a timeless design that never goes out of style.\n\nRegal Stone Combination\nThe stunning combination of ruby red and emerald green stones creates a royal look perfect for festivals and special occasions.\n\nPerfect for Festive Wear\n• Diwali celebrations\n• Karva Chauth\n• Wedding guest outfits\n• Cultural events\n• Office festive parties\n\nProduct Highlights\n• Oxidized gold finish\n• Ruby and emerald stone detailing\n• Traditional dome jhumka shape\n• Intricate stud design\n• Bead fringes at bottom\n• Secure push-back closure\n\nCare Instructions\n• Store in velvet pouch\n• Keep dry and away from moisture\n• Wipe gently after each use\n• Avoid chemical cleaners',
549.00, 329.00, 1, 2, 8, '/uploads/products/e4_1.png', 75, 4.6, 189, FALSE, 'Amshine', 'https://meesho.com', 'https://flipkart.com', 'https://amazon.in'),

('Silver Plated American Diamond Bridal Jhumka Earrings',
'Elegant silver plated jhumka earrings featuring premium American diamond (zircon) stones. The delicate jhumka with beaded fringes is perfect for modern brides and party occasions.\n\nPremium Zircon Stones\nHigh-quality American diamond stones that shine like real diamonds, giving a luxurious sparkle to your look.\n\nElegant Jhumka Design\nThe slim, elongated jhumka shape with silver beaded fringes creates a sophisticated and modern traditional look.\n\nPerfect for Modern Brides\n• Reception ceremonies\n• Engagement parties\n• Cocktail evenings\n• Christian and Muslim weddings\n• Fusion wear occasions\n\nProduct Highlights\n• Silver plated finish\n• Premium AD/zircon stones\n• Elongated jhumka design\n• Silver bead fringes\n• Pearl top accent\n• Lightweight design\n\nCare Instructions\n• Store in velvet box\n• Handle with care\n• Avoid water contact\n• Clean with soft cloth',
799.00, 499.00, 1, 2, 9, '/uploads/products/e5_1.png', 40, 4.9, 145, TRUE, 'Amshine', 'https://meesho.com', 'https://flipkart.com', 'https://amazon.in'),

('Polki Style Kundan Danglers with Pastel Stone & Pearl Drops',
'Sophisticated polki-style earrings featuring kundan work with beautiful pastel colored center stones and delicate pearl drop fringes. Perfect for elegant party wear.\n\nPolki-Inspired Design\nInspired by royal polki jewellery, these earrings feature uncut stone look with intricate goldwork detailing.\n\nPastel Stone Elegance\nThe soft pastel colored center stones add a modern touch to the traditional design, making these earrings versatile for various outfits.\n\nPerfect for Party Wear\n• Cocktail parties\n• Reception events\n• Anniversary dinners\n• Festival gatherings\n• Designer wear occasions\n\nProduct Highlights\n• Gold plated base\n• Polki-inspired kundan work\n• Pastel colored stones\n• Pearl drop fringes\n• Two-tier elegant design\n• Medium weight\n\nCare Instructions\n• Store in dry jewellery box\n• Protect pearl drops from moisture\n• Clean with dry soft cloth\n• Keep separate from other pieces',
699.00, 399.00, 1, 2, 9, '/uploads/products/e6_1.png', 50, 4.7, 234, TRUE, 'Amshine', 'https://meesho.com', 'https://flipkart.com', 'https://amazon.in');

-- ===============================
-- 6 BRACELETS
-- ===============================
INSERT INTO products (name, description, price, sale_price, category_id, subcategory_id, sub_subcategory_id, image, stock, rating, num_reviews, featured, brand, meesho_link, flipkart_link, amazon_link) VALUES

('Gold Plated Ruby Flower Kada Bangle',
'Beautiful gold plated kada style bangle featuring a central ruby flower design with sparkling stones. The sleek band with bow-tie accent makes it perfect for both daily wear and special occasions.\n\nTraditional Kada Design\nThe classic kada shape with a modern twist - featuring a decorative central flower with a ruby centerpiece surrounded by small diamond-look stones.\n\nVersatile Styling\nThis bracelet can be worn with traditional Indian outfits as well as Indo-western wear, making it a versatile addition to any jewellery collection.\n\nPerfect for Daily & Special Wear\n• Office wear\n• Casual outings\n• Festival celebrations\n• Daily wear\n• Gift for loved ones\n\nProduct Highlights\n• Gold plated finish\n• Central ruby stone\n• Diamond-look surrounding stones\n• Sleek band design\n• Secure closure\n• Adjustable fit\n\nCare Instructions\n• Remove before bathing\n• Avoid perfume contact\n• Clean with soft cloth\n• Store in jewellery box',
499.00, 279.00, 1, 5, 10, '/uploads/products/b1_1.png', 120, 4.6, 423, TRUE, 'Amshine', 'https://meesho.com', 'https://flipkart.com', 'https://amazon.in'),

('Gold Plated Dual Layer Bangle with Swan Accent',
'Elegant dual-layer gold plated bangle featuring a unique swan-inspired design with zircon stones. The adjustable fit makes it suitable for most wrist sizes.\n\nUnique Swan Design\nThe delicate swan motif at the top adds a touch of elegance and uniqueness. The small zircon stones add just the right amount of sparkle.\n\nDual Layer Sophistication\nThe two-layer design gives the illusion of wearing multiple bangles, offering more volume without compromising on elegance.\n\nPerfect for Everyday Elegance\n• Office and workplace\n• Brunches and lunches\n• Casual weekends\n• Light occasions\n• Gift for friends\n\nProduct Highlights\n• Gold plated dual band\n• Swan design accent\n• Delicate zircon stones\n• Adjustable fit\n• Lightweight and comfortable\n• Daily wear suitable\n\nCare Instructions\n• Avoid water contact\n• Remove during exercise\n• Clean with dry cloth\n• Keep in jewellery pouch',
449.00, 249.00, 1, 5, 10, '/uploads/products/b2_1.png', 150, 4.5, 567, FALSE, 'Amshine', 'https://meesho.com', 'https://flipkart.com', 'https://amazon.in'),

('Gold Plated Open Heart Cuff Bracelet',
'Minimalist and stylish open cuff bracelet featuring a delicate heart design on one end and a small zircon stone on the other. Perfect for modern women who love understated elegance.\n\nModern Minimalist Design\nThe open cuff design allows for easy wearing and removal. The twisted gold rope pattern adds texture without being too flashy.\n\nHeart Accent Detail\nThe small heart on one end and the sparkling zircon stone on the other create an asymmetric design that is both modern and romantic.\n\nPerfect for Daily & Casual Wear\n• Office wear\n• Coffee dates\n• Casual evenings\n• Gift for girlfriend\n• Everyday elegance\n\nProduct Highlights\n• Gold plated finish\n• Open cuff design\n• Heart motif detail\n• Zircon stone accent\n• Twisted rope texture\n• Fits most wrist sizes\n\nCare Instructions\n• Avoid prolonged water exposure\n• Store in dry place\n• Polish gently if needed\n• Handle with care',
399.00, 229.00, 1, 5, 11, '/uploads/products/b3_1.png', 200, 4.7, 789, TRUE, 'Amshine', 'https://meesho.com', 'https://flipkart.com', 'https://amazon.in'),

('Gold Plated Dual Strand Flower Cuff Bracelet',
'Charming dual-strand cuff bracelet featuring delicate flower motifs with zircon centers. The cuff style makes it easy to wear and perfect for layered jewellery looks.\n\nCharming Flower Design\nEach strand features small flower motifs with sparkling zircon stones at the center, creating a delicate and feminine look.\n\nDual Strand Elegance\nThe two strands of this cuff bracelet give dimension and make it look like you are wearing two separate bracelets.\n\nPerfect for Casual & Semi-formal\n• College wear\n• Casual parties\n• Indo-western outfits\n• Summer dresses\n• Gift for young women\n\nProduct Highlights\n• Gold plated finish\n• Dual strand cuff design\n• Flower motifs throughout\n• Small zircon stones\n• Adjustable open cuff\n• Lightweight construction\n\nCare Instructions\n• Store in soft pouch\n• Avoid chemicals and perfume\n• Clean with microfiber cloth\n• Handle gently',
549.00, 329.00, 1, 5, 12, '/uploads/products/b4_1.png', 90, 4.6, 234, FALSE, 'Amshine', 'https://meesho.com', 'https://flipkart.com', 'https://amazon.in'),

('Gold Plated Set of 2 Zircon Stone Bangles',
'Set of 2 matching gold plated bangles featuring small zircon stones with a central medallion design. Perfect for doubling up or wearing separately for different looks.\n\nSet of Two\nYou get 2 matching bangles - wear them together for a statement look or pair them with other bracelets for a stacked style.\n\nElegant Medallion Design\nEach bangle features a central circular medallion with a beautiful cluster of small zircon stones, creating a delicate yet eye-catching design.\n\nPerfect for Multiple Occasions\n• Office wear\n• Weekend brunches\n• Traditional events\n• Fusion wear\n• Daily elegance\n\nProduct Highlights\n• Set of 2 bangles\n• Gold plated finish\n• Central medallion design\n• Cluster of zircon stones\n• Sleek band design\n• Stackable style\n\nCare Instructions\n• Store pair together\n• Keep away from moisture\n• Clean with soft cloth\n• Avoid perfume contact',
699.00, 399.00, 1, 5, 10, '/uploads/products/b5_1.png', 75, 4.7, 345, TRUE, 'Amshine', 'https://meesho.com', 'https://flipkart.com', 'https://amazon.in'),

('Gold Plated Pink Ruby Flower Open Cuff Bracelet',
'Stunning open cuff bracelet featuring beautiful pink ruby flowers on one end and decorative gold balls on the other. The textured band design adds depth and visual appeal.\n\nVibrant Pink Ruby Flowers\nThe cluster of pink ruby-colored stones arranged in a floral pattern is the highlight of this bracelet, making it perfect for adding color to any outfit.\n\nTextured Band Detailing\nThe textured pattern on the gold band gives this bracelet a unique, artisanal feel that sets it apart from plain bangles.\n\nPerfect for Festive & Party Wear\n• Wedding functions\n• Festival celebrations\n• Party events\n• Anniversary dinners\n• Special occasions\n\nProduct Highlights\n• Gold plated finish\n• Pink ruby flower cluster\n• Gold ball accents\n• Textured band pattern\n• Open cuff design\n• Fits most wrist sizes\n\nCare Instructions\n• Store in jewellery box\n• Avoid water and perfume\n• Clean with soft dry cloth\n• Keep in dry place',
749.00, 449.00, 1, 5, 12, '/uploads/products/b6_1.png', 60, 4.8, 178, TRUE, 'Amshine', 'https://meesho.com', 'https://flipkart.com', 'https://amazon.in');

-- ===============================
-- Product Images (4 per product)
-- ===============================
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
-- Earrings (products 8-13)
(8, '/uploads/products/e1_1.png', 0), (8, '/uploads/products/e1_2.png', 1), (8, '/uploads/products/e1_3.png', 2), (8, '/uploads/products/e1_4.png', 3),
(9, '/uploads/products/e2_1.png', 0), (9, '/uploads/products/e2_2.png', 1), (9, '/uploads/products/e2_3.png', 2), (9, '/uploads/products/e2_4.png', 3),
(10, '/uploads/products/e3_1.png', 0), (10, '/uploads/products/e3_2.png', 1), (10, '/uploads/products/e3_3.png', 2), (10, '/uploads/products/e3_4.png', 3),
(11, '/uploads/products/e4_1.png', 0), (11, '/uploads/products/e4_2.png', 1), (11, '/uploads/products/e4_3.png', 2), (11, '/uploads/products/e4_4.png', 3),
(12, '/uploads/products/e5_1.png', 0), (12, '/uploads/products/e5_2.png', 1), (12, '/uploads/products/e5_3.png', 2), (12, '/uploads/products/e5_4.png', 3),
(13, '/uploads/products/e6_1.png', 0), (13, '/uploads/products/e6_2.png', 1), (13, '/uploads/products/e6_3.png', 2), (13, '/uploads/products/e6_4.png', 3),
-- Bracelets (products 14-19)
(14, '/uploads/products/b1_1.png', 0), (14, '/uploads/products/b1_2.png', 1), (14, '/uploads/products/b1_3.png', 2), (14, '/uploads/products/b1_4.png', 3),
(15, '/uploads/products/b2_1.png', 0), (15, '/uploads/products/b2_2.png', 1), (15, '/uploads/products/b2_3.png', 2), (15, '/uploads/products/b2_4.png', 3),
(16, '/uploads/products/b3_1.png', 0), (16, '/uploads/products/b3_2.png', 1), (16, '/uploads/products/b3_3.png', 2), (16, '/uploads/products/b3_4.png', 3),
(17, '/uploads/products/b4_1.png', 0), (17, '/uploads/products/b4_2.png', 1), (17, '/uploads/products/b4_3.png', 2), (17, '/uploads/products/b4_4.png', 3),
(18, '/uploads/products/b5_1.png', 0), (18, '/uploads/products/b5_2.png', 1), (18, '/uploads/products/b5_3.png', 2), (18, '/uploads/products/b5_4.png', 3),
(19, '/uploads/products/b6_1.png', 0), (19, '/uploads/products/b6_2.png', 1), (19, '/uploads/products/b6_3.png', 2), (19, '/uploads/products/b6_4.png', 3);



-- Add Ring subcategory (id 6)
INSERT INTO subcategories (id, category_id, name, description, image) VALUES
(6, 1, 'Ring', 'Beautiful rings and adjustable finger jewellery', '/uploads/products/r1_1.png');

-- Add sub-subcategories
INSERT INTO sub_subcategories (subcategory_id, name, description) VALUES
(6, 'Floral Ring', 'Flower design rings'),
(6, 'Victorian Ring', 'Royal Victorian style rings'),
(6, 'Kundan Ring', 'Traditional kundan stone rings'),
(3, 'Heart Mangalsutra', 'Heart shape pendant mangalsutra'),
(3, 'Leaf Mangalsutra', 'Leaf pattern mangalsutra'),
(3, 'Single Line Mangalsutra', 'Simple single chain mangalsutra'),
(3, 'Double Chain Mangalsutra', 'Double layered mangalsutra'),
(3, 'Diamond Mangalsutra', 'Diamond studded mangalsutra');

-- ==============================
-- 5 RINGS (products 20-24)
-- ==============================
INSERT INTO products (name, description, price, sale_price, category_id, subcategory_id, sub_subcategory_id, image, stock, rating, num_reviews, featured, brand, meesho_link, flipkart_link, amazon_link) VALUES

('Gold Plated Traditional Floral Ring with Ruby Stones',
'Elegant adjustable ring featuring a round floral medallion design with ruby red stone accents and beaded detailing. Perfect for traditional wear and festive occasions.\n\nTraditional Indian Design\nThe classic round disk with intricate filigree work and flower motifs makes this ring a timeless piece of Indian jewellery.\n\nAdjustable Comfort Fit\nThe open-ended adjustable design ensures a perfect fit for any finger size, making it easy to gift and comfortable to wear.\n\nPerfect for Traditional Occasions\n• Festivals and pujas\n• Wedding ceremonies\n• Traditional functions\n• Cultural events\n• Daily ethnic wear\n\nProduct Highlights\n• Gold plated finish\n• Floral medallion design\n• Ruby red stone accents\n• Adjustable open band\n• Beaded border detailing\n• Comfortable lightweight\n\nCare Instructions\n• Remove before washing hands\n• Avoid chemicals and perfume\n• Clean with soft dry cloth\n• Store in jewellery box',
499.00, 279.00, 1, 6, 13, '/uploads/products/r1_1.png', 100, 4.7, 234, TRUE, 'Amshine', 'https://meesho.com', 'https://flipkart.com', 'https://amazon.in'),

('Gold Plated Floral Statement Ring with Multi-Color Stones',
'Bold statement ring featuring an intricate floral design with colorful red and green stones. The large floral top makes it a perfect statement piece for any outfit.\n\nStatement Floral Design\nThe oversized floral top with detailed petal work and colored stones creates a bold, eye-catching look perfect for special occasions.\n\nColorful Accents\nThe combination of red and green stones in the center adds a royal touch reminiscent of traditional temple jewellery.\n\nPerfect for Parties & Events\n• Wedding guest wear\n• Reception events\n• Festival celebrations\n• Party wear\n• Ethnic gatherings\n\nProduct Highlights\n• Gold plated finish\n• Large floral statement design\n• Red and green enamel stones\n• Adjustable band\n• Textured petal detailing\n• High quality finish\n\nCare Instructions\n• Remove before sleeping\n• Avoid water contact\n• Wipe with soft cloth\n• Store separately',
449.00, 249.00, 1, 6, 13, '/uploads/products/r2_1.png', 80, 4.6, 189, TRUE, 'Amshine', 'https://meesho.com', 'https://flipkart.com', 'https://amazon.in'),

('Gold Plated Victorian Temple Ring with Ruby Centerpiece',
'Regal Victorian-inspired ring with a large round medallion featuring intricate temple-style detailing and a central ruby stone. Perfect for adding royal elegance to traditional outfits.\n\nVictorian Royal Design\nInspired by Victorian-era jewellery, this ring features multi-layered goldwork with ornate details that exude royal elegance.\n\nCentral Ruby Stone\nThe ruby red central stone adds a luxurious touch, while the surrounding goldwork creates a halo effect that enhances its appeal.\n\nPerfect for Bridal & Festive Wear\n• Bridal functions\n• Wedding parties\n• Diwali and major festivals\n• Traditional photoshoots\n• Royal-themed events\n\nProduct Highlights\n• Gold plated antique finish\n• Large round Victorian design\n• Ruby red center stone\n• Scalloped edge pattern\n• Adjustable ring band\n• Heirloom-quality look\n\nCare Instructions\n• Store in velvet pouch\n• Handle with care\n• Avoid moisture\n• Clean with microfiber cloth',
599.00, 349.00, 1, 6, 14, '/uploads/products/r3_1.png', 60, 4.8, 156, TRUE, 'Amshine', 'https://meesho.com', 'https://flipkart.com', 'https://amazon.in'),

('Gold Plated Kundan Flower Ring with Ruby & Emerald Stones',
'Traditional kundan-style ring featuring a beautiful flower design with ruby and emerald stones. The scalloped border adds a vintage touch to this elegant piece.\n\nKundan Craftsmanship\nThe traditional kundan setting holds the stones securely while showcasing the beautiful details of the flower design.\n\nMulti-Stone Elegance\nThe combination of ruby red and emerald green stones creates a royal look that complements traditional Indian outfits beautifully.\n\nPerfect for Traditional Events\n• Wedding ceremonies\n• Sangeet functions\n• Karva Chauth\n• Festival celebrations\n• Family gatherings\n\nProduct Highlights\n• Gold plated base\n• Kundan-style stone setting\n• Ruby and emerald stones\n• Scalloped flower design\n• Adjustable ring\n• Traditional Indian look\n\nCare Instructions\n• Remove before household chores\n• Avoid soap and chemicals\n• Clean with dry cloth\n• Store in jewellery box',
549.00, 299.00, 1, 6, 15, '/uploads/products/r4_1.png', 70, 4.7, 201, FALSE, 'Amshine', 'https://meesho.com', 'https://flipkart.com', 'https://amazon.in'),

('Gold Plated Peacock Design Ring with Ruby Stone',
'Unique peacock-inspired ring with intricate feather detailing and a small ruby stone accent. The scalloped border and detailed design make it a conversation starter.\n\nPeacock Motif Design\nThe peacock is a traditional Indian motif symbolizing beauty and grace. This ring captures that essence with beautiful feather-like patterns.\n\nDelicate Ruby Accent\nA small ruby stone adds just the right touch of color, complementing the gold finish without overwhelming the intricate design.\n\nPerfect for Cultural Events\n• Traditional pujas\n• Dance performances\n• Festival wear\n• Cultural programs\n• Heritage events\n\nProduct Highlights\n• Gold plated finish\n• Peacock motif design\n• Small ruby stone accent\n• Scalloped border\n• Adjustable band\n• Unique conversation piece\n\nCare Instructions\n• Handle gently\n• Avoid scratching surfaces\n• Wipe with soft cloth\n• Store carefully',
499.00, 279.00, 1, 6, 13, '/uploads/products/r5_1.png', 85, 4.6, 167, FALSE, 'Amshine', 'https://meesho.com', 'https://flipkart.com', 'https://amazon.in');

-- ==============================
-- 15 MANGALSUTRAS (products 25-39)
-- ==============================
INSERT INTO products (name, description, price, sale_price, category_id, subcategory_id, sub_subcategory_id, image, stock, rating, num_reviews, featured, brand, meesho_link, flipkart_link, amazon_link) VALUES

('Gold Plated Single Line Mangalsutra with Sunflower Pendant',
'Elegant single chain mangalsutra featuring a beautiful sunflower-inspired pendant with zircon stones and a pearl centerpiece. Perfect for daily wear.\n\nDesigned for elegance and tradition, this lightweight mangalsutra offers perfect blend of modern aesthetics with cultural significance. The black beaded chain with gold accents completes the traditional mangalsutra look.\n\nProduct Highlights\n• Gold plated finish\n• Single chain design\n• Sunflower pendant with zircon stones\n• Black bead accents\n• Pearl centerpiece\n• Lightweight daily wear\n\nPerfect For\n• Daily wear\n• Office wear\n• Traditional events\n• Festival celebrations\n• Anniversary gifts\n\nCare Instructions\n• Remove before sleeping\n• Avoid water and perfume\n• Clean with soft cloth\n• Store in jewellery box',
499.00, 279.00, 1, 3, 17, '/uploads/products/m1_1.png', 100, 4.7, 345, TRUE, 'Amshine', 'https://meesho.com', 'https://flipkart.com', 'https://amazon.in'),

('Gold Plated Mangalsutra with Heart Floral Pendant',
'Romantic heart-shaped floral pendant mangalsutra with zircon stones. The delicate heart design symbolizes love and unity in marriage.\n\nProduct Highlights\n• Gold plated chain and pendant\n• Heart floral design with zircon\n• Traditional black bead accents\n• Lightweight wear\n• Romantic design\n\nPerfect For\n• Daily wear\n• Anniversary wear\n• Valentine''s Day gift\n• Romantic occasions\n• Gift for wife\n\nCare Instructions\n• Store dry\n• Clean with soft cloth\n• Avoid chemicals\n• Handle with care',
549.00, 299.00, 1, 3, 16, '/uploads/products/m2_1.png', 90, 4.8, 432, TRUE, 'Amshine', 'https://meesho.com', 'https://flipkart.com', 'https://amazon.in'),

('Gold Plated Mangalsutra with Crystal Leaf Pendant',
'Delicate leaf-inspired pendant mangalsutra with sparkling crystals. The modern design combines tradition with contemporary styling.\n\nProduct Highlights\n• Gold plated finish\n• Leaf pendant with crystals\n• Small pearl drop accent\n• Traditional mangalsutra beads\n• Modern minimalist design\n\nPerfect For\n• Office wear\n• Daily wear\n• Casual occasions\n• Traditional events\n• Modern bride\n\nCare Instructions\n• Avoid moisture\n• Store separately\n• Clean gently\n• Handle leaf pattern carefully',
449.00, 249.00, 1, 3, 17, '/uploads/products/m3_1.png', 110, 4.6, 278, FALSE, 'Amshine', 'https://meesho.com', 'https://flipkart.com', 'https://amazon.in'),

('Gold Plated Mangalsutra with Stylish Pendant Design',
'Beautiful mangalsutra with a stylish modern pendant featuring intricate goldwork and sparkling stones. Perfect for modern married women.\n\nProduct Highlights\n• Gold plated finish\n• Modern pendant design\n• Intricate detailing\n• Black bead accents\n• Lightweight wear\n\nPerfect For\n• Daily wear\n• Office wear\n• Festive occasions\n• Social gatherings\n\nCare Instructions\n• Remove before bath\n• Store dry\n• Clean gently\n• Avoid perfume',
499.00, 279.00, 1, 3, 17, '/uploads/products/m4_1.png', 95, 4.7, 198, FALSE, 'Amshine', 'https://meesho.com', 'https://flipkart.com', 'https://amazon.in'),

('Gold Plated Designer Mangalsutra with Crystal Accents',
'Elegant designer mangalsutra featuring a unique pendant with crystal accents. The contemporary design is perfect for the modern woman.\n\nProduct Highlights\n• Gold plated finish\n• Designer pendant style\n• Crystal detailing\n• Traditional bead chain\n• Modern look\n\nPerfect For\n• Daily wear\n• Festive wear\n• Office occasions\n• Modern bridal look\n\nCare Instructions\n• Store carefully\n• Clean with soft cloth\n• Avoid water\n• Handle gently',
599.00, 349.00, 1, 3, 17, '/uploads/products/m5_1.png', 75, 4.5, 156, FALSE, 'Amshine', 'https://meesho.com', 'https://flipkart.com', 'https://amazon.in'),

('Gold Plated Double Chain Mangalsutra with Designer Pendant',
'Traditional double-chain mangalsutra with a statement pendant. The double layer of black beads creates a classic mangalsutra look preferred in many regions of India.\n\nProduct Highlights\n• Gold plated finish\n• Double chain design\n• Designer pendant\n• Traditional black beads\n• Statement look\n\nPerfect For\n• Traditional brides\n• Wedding functions\n• Daily traditional wear\n• Festival celebrations\n\nCare Instructions\n• Store in dry box\n• Avoid moisture\n• Clean gently\n• Protect pendant',
699.00, 399.00, 1, 3, 18, '/uploads/products/m6_1.png', 60, 4.8, 234, TRUE, 'Amshine', 'https://meesho.com', 'https://flipkart.com', 'https://amazon.in'),

('Gold Plated Elegant Mangalsutra with Floral Pendant',
'Beautiful mangalsutra with an elegant floral pendant design. Perfect for brides and married women who appreciate classic jewellery.\n\nProduct Highlights\n• Gold plated chain\n• Elegant floral pendant\n• Small zircon accents\n• Traditional look\n• Lightweight design\n\nPerfect For\n• Daily wear\n• Office wear\n• Traditional events\n• Anniversary\n\nCare Instructions\n• Remove before water activities\n• Store dry\n• Clean with soft cloth\n• Handle pendant carefully',
449.00, 249.00, 1, 3, 17, '/uploads/products/m7_1.png', 105, 4.6, 321, FALSE, 'Amshine', 'https://meesho.com', 'https://flipkart.com', 'https://amazon.in'),

('Gold Plated Mangalsutra with Statement Pendant',
'Statement mangalsutra with a bold pendant design that stands out. Perfect for modern brides wanting to make a statement.\n\nProduct Highlights\n• Gold plated finish\n• Bold statement pendant\n• Traditional mangalsutra beads\n• Modern design\n• Eye-catching look\n\nPerfect For\n• Wedding day wear\n• Reception\n• Special occasions\n• Anniversary\n\nCare Instructions\n• Store carefully\n• Clean regularly\n• Avoid chemicals\n• Handle with care',
799.00, 449.00, 1, 3, 17, '/uploads/products/m8_1.png', 50, 4.7, 187, TRUE, 'Amshine', 'https://meesho.com', 'https://flipkart.com', 'https://amazon.in'),

('Gold Plated American Diamond Box Mangalsutra',
'Premium American Diamond (AD) mangalsutra with a box-shaped pendant featuring high-quality zircon stones. A luxurious option for modern brides.\n\nProduct Highlights\n• Gold plated finish\n• American Diamond (AD) stones\n• Box pendant shape\n• Premium quality\n• Sparkling finish\n\nPerfect For\n• Reception wear\n• Party occasions\n• Anniversary\n• Wedding events\n• Gift for wife\n\nCare Instructions\n• Store in velvet pouch\n• Avoid perfume\n• Clean with AD polish\n• Handle with care',
899.00, 499.00, 1, 3, 19, '/uploads/products/m9_1.png', 45, 4.8, 145, TRUE, 'Amshine', 'https://meesho.com', 'https://flipkart.com', 'https://amazon.in'),

('Gold Plated Mangalsutra with Fish Scale Pendant Design',
'Unique mangalsutra with a pendant featuring fish scale pattern encrusted with zircon stones. The geometric modern design is perfect for fashion-forward brides.\n\nProduct Highlights\n• Gold plated finish\n• Fish scale pattern pendant\n• Zircon stone encrusted\n• Modern geometric design\n• Elegant look\n\nPerfect For\n• Modern brides\n• Office wear\n• Social events\n• Daily wear\n\nCare Instructions\n• Store dry\n• Clean gently\n• Avoid chemicals\n• Handle geometric edges carefully',
549.00, 299.00, 1, 3, 19, '/uploads/products/m10_1.png', 85, 4.7, 212, FALSE, 'Amshine', 'https://meesho.com', 'https://flipkart.com', 'https://amazon.in'),

('Gold Plated Heart Shape Mangalsutra with AD Stones',
'Romantic heart-shaped mangalsutra pendant with premium American Diamond stones. The heart design symbolizes eternal love.\n\nProduct Highlights\n• Gold plated chain\n• Heart shape pendant\n• AD stone work\n• Small drop accent\n• Romantic design\n\nPerfect For\n• Anniversary wear\n• Valentine gift\n• Romantic occasions\n• Daily wear by married women\n\nCare Instructions\n• Store in velvet pouch\n• Clean with soft cloth\n• Avoid water\n• Handle with care',
649.00, 349.00, 1, 3, 16, '/uploads/products/m11_1.png', 70, 4.9, 298, TRUE, 'Amshine', 'https://meesho.com', 'https://flipkart.com', 'https://amazon.in'),

('Gold Plated Kalash Design Mangalsutra with Pearl Drop',
'Traditional Kalash-inspired mangalsutra with sacred symbolism. The circular pendant with floral top and pearl drop is perfect for religious married women.\n\nProduct Highlights\n• Gold plated finish\n• Kalash-inspired circular design\n• Floral top detail\n• Pearl drop accent\n• Religious symbolism\n\nPerfect For\n• Religious ceremonies\n• Temple visits\n• Traditional pujas\n• Cultural events\n\nCare Instructions\n• Keep sacred\n• Store respectfully\n• Clean gently\n• Handle pearl carefully',
579.00, 319.00, 1, 3, 17, '/uploads/products/m12_1.png', 80, 4.8, 267, FALSE, 'Amshine', 'https://meesho.com', 'https://flipkart.com', 'https://amazon.in'),

('Gold Plated Delicate Leaf Mangalsutra with AD Stones',
'Graceful leaf-patterned mangalsutra with sparkling American Diamond stones. The leaf design is accented by a small heart drop for added sweetness.\n\nProduct Highlights\n• Gold plated finish\n• Delicate leaf pattern\n• Premium AD stones\n• Heart drop accent\n• Graceful design\n\nPerfect For\n• Daily wear\n• Office wear\n• Casual occasions\n• Modern married women\n\nCare Instructions\n• Store carefully\n• Clean with dry cloth\n• Avoid moisture\n• Handle pattern gently',
499.00, 279.00, 1, 3, 17, '/uploads/products/m13_1.png', 95, 4.7, 189, FALSE, 'Amshine', 'https://meesho.com', 'https://flipkart.com', 'https://amazon.in'),

('Gold Plated Round Medallion Mangalsutra',
'Classic round medallion mangalsutra with intricate goldwork. The circular pendant is a timeless choice for traditional married women.\n\nProduct Highlights\n• Gold plated finish\n• Round medallion pendant\n• Intricate goldwork\n• Traditional design\n• Classic look\n\nPerfect For\n• Traditional wear\n• Daily wear\n• Festival occasions\n• Wedding functions\n\nCare Instructions\n• Store dry\n• Clean with soft cloth\n• Avoid chemicals\n• Regular polish',
549.00, 299.00, 1, 3, 17, '/uploads/products/m14_1.png', 75, 4.6, 176, FALSE, 'Amshine', 'https://meesho.com', 'https://flipkart.com', 'https://amazon.in'),

('Gold Plated Round Statement Mangalsutra with Crystal',
'Statement round mangalsutra with a crystal centerpiece. Perfect for modern married women who love classic designs with a contemporary twist.\n\nProduct Highlights\n• Gold plated finish\n• Round statement pendant\n• Crystal centerpiece\n• Traditional beads\n• Modern classic design\n\nPerfect For\n• Wedding day\n• Reception\n• Anniversary\n• Special occasions\n\nCare Instructions\n• Handle with care\n• Store in box\n• Clean gently\n• Avoid hard surfaces',
699.00, 399.00, 1, 3, 19, '/uploads/products/m15_1.png', 55, 4.8, 201, TRUE, 'Amshine', 'https://meesho.com', 'https://flipkart.com', 'https://amazon.in');

-- ==============================
-- Product Images (4 per product, 19 products already exist)
-- Rings: 20-24, Mangalsutra: 25-39
-- ==============================
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
-- Rings (20-24)
(20, '/uploads/products/r1_1.png', 0), (20, '/uploads/products/r1_2.png', 1), (20, '/uploads/products/r1_3.png', 2), (20, '/uploads/products/r1_4.png', 3),
(21, '/uploads/products/r2_1.png', 0), (21, '/uploads/products/r2_2.png', 1), (21, '/uploads/products/r2_3.png', 2), (21, '/uploads/products/r2_4.png', 3),
(22, '/uploads/products/r3_1.png', 0), (22, '/uploads/products/r3_2.png', 1), (22, '/uploads/products/r3_3.png', 2), (22, '/uploads/products/r3_4.jpeg', 3),
(23, '/uploads/products/r4_1.png', 0), (23, '/uploads/products/r4_2.png', 1), (23, '/uploads/products/r4_3.png', 2), (23, '/uploads/products/r4_4.png', 3),
(24, '/uploads/products/r5_1.png', 0), (24, '/uploads/products/r5_2.png', 1), (24, '/uploads/products/r5_3.jpeg', 2),
-- Mangalsutras (25-39)
(25, '/uploads/products/m1_1.png', 0), (25, '/uploads/products/m1_2.png', 1), (25, '/uploads/products/m1_3.png', 2), (25, '/uploads/products/m1_4.png', 3),
(26, '/uploads/products/m2_1.png', 0), (26, '/uploads/products/m2_2.png', 1), (26, '/uploads/products/m2_3.png', 2), (26, '/uploads/products/m2_4.png', 3),
(27, '/uploads/products/m3_1.png', 0), (27, '/uploads/products/m3_2.png', 1), (27, '/uploads/products/m3_3.png', 2), (27, '/uploads/products/m3_4.png', 3),
(28, '/uploads/products/m4_1.png', 0), (28, '/uploads/products/m4_2.png', 1), (28, '/uploads/products/m4_3.png', 2), (28, '/uploads/products/m4_4.png', 3),
(29, '/uploads/products/m5_1.png', 0), (29, '/uploads/products/m5_2.png', 1), (29, '/uploads/products/m5_3.png', 2), (29, '/uploads/products/m5_4.png', 3),
(30, '/uploads/products/m6_1.png', 0), (30, '/uploads/products/m6_2.png', 1), (30, '/uploads/products/m6_3.png', 2), (30, '/uploads/products/m6_4.png', 3),
(31, '/uploads/products/m7_1.png', 0), (31, '/uploads/products/m7_2.png', 1), (31, '/uploads/products/m7_3.png', 2), (31, '/uploads/products/m7_4.png', 3),
(32, '/uploads/products/m8_1.png', 0), (32, '/uploads/products/m8_2.png', 1), (32, '/uploads/products/m8_3.png', 2), (32, '/uploads/products/m8_4.png', 3),
(33, '/uploads/products/m9_1.png', 0), (33, '/uploads/products/m9_2.png', 1), (33, '/uploads/products/m9_3.png', 2), (33, '/uploads/products/m9_4.png', 3),
(34, '/uploads/products/m10_1.png', 0), (34, '/uploads/products/m10_2.png', 1), (34, '/uploads/products/m10_3.png', 2), (34, '/uploads/products/m10_4.png', 3),
(35, '/uploads/products/m11_1.png', 0), (35, '/uploads/products/m11_2.png', 1), (35, '/uploads/products/m11_3.png', 2), (35, '/uploads/products/m11_4.png', 3),
(36, '/uploads/products/m12_1.png', 0), (36, '/uploads/products/m12_2.png', 1), (36, '/uploads/products/m12_3.png', 2), (36, '/uploads/products/m12_4.png', 3),
(37, '/uploads/products/m13_1.png', 0), (37, '/uploads/products/m13_2.png', 1), (37, '/uploads/products/m13_3.png', 2), (37, '/uploads/products/m13_4.png', 3),
(38, '/uploads/products/m14_1.png', 0), (38, '/uploads/products/m14_2.png', 1), (38, '/uploads/products/m14_3.png', 2), (38, '/uploads/products/m14_4.png', 3),
(39, '/uploads/products/m15_1.png', 0), (39, '/uploads/products/m15_2.png', 1), (39, '/uploads/products/m15_3.png', 2), (39, '/uploads/products/m15_4.png', 3);
