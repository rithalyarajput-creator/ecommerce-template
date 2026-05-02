<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../config/auth.php';

$action = $_GET['action'] ?? '';
$db = new Database();
$pdo = $db->getConnection();

// ── become-seller (any logged-in user can apply) ──────────────────────────────
if ($action === 'become-seller') {
    requireAuth();
    $user = getAuthUser();
    $data = json_decode(file_get_contents('php://input'), true);

    $shopName = trim($data['shop_name'] ?? '');
    $phone    = trim($data['phone'] ?? '');
    if (!$shopName) { http_response_code(400); echo json_encode(['message' => 'Shop name required']); exit; }

    // Already a seller?
    $chk = $pdo->prepare('SELECT id, status FROM seller_profiles WHERE user_id = ?');
    $chk->execute([$user['id']]);
    if ($row = $chk->fetch()) {
        echo json_encode(['message' => 'Already applied', 'status' => $row['status']]);
        exit;
    }

    $pdo->prepare('
        INSERT INTO seller_profiles (user_id, shop_name, shop_description, phone, whatsapp, address, city, state, pincode, gst_number, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "pending")
    ')->execute([
        $user['id'],
        $shopName,
        trim($data['shop_description'] ?? ''),
        $phone,
        trim($data['whatsapp'] ?? $phone),
        trim($data['address'] ?? ''),
        trim($data['city'] ?? ''),
        trim($data['state'] ?? ''),
        trim($data['pincode'] ?? ''),
        trim($data['gst_number'] ?? '')
    ]);

    // Update user role to seller + approve immediately for demo
    $pdo->prepare("UPDATE users SET role = 'seller' WHERE id = ?")->execute([$user['id']]);
    $pdo->prepare("UPDATE seller_profiles SET status = 'approved', approved_at = NOW() WHERE user_id = ?")->execute([$user['id']]);

    // Return updated token info
    $userRow = $pdo->prepare('SELECT id, name, email, phone, role FROM users WHERE id = ?');
    $userRow->execute([$user['id']]);
    $updatedUser = $userRow->fetch(PDO::FETCH_ASSOC);

    echo json_encode(['message' => 'Seller account approved!', 'user' => $updatedUser]);
    exit;
}

// ── seller dashboard stats ────────────────────────────────────────────────────
if ($action === 'dashboard') {
    requireAuth();
    $user = getAuthUser();
    $sellerId = $user['id'];

    $stats = [];

    $r = $pdo->prepare('SELECT COUNT(*) as c, COALESCE(SUM(stock),0) as stock FROM products WHERE seller_id = ?');
    $r->execute([$sellerId]); $row = $r->fetch();
    $stats['totalProducts'] = (int)$row['c'];
    $stats['totalStock']    = (int)$row['stock'];

    $r2 = $pdo->prepare('
        SELECT COUNT(DISTINCT oi.order_id) as orders, COALESCE(SUM(oi.price * oi.quantity),0) as revenue
        FROM order_items oi WHERE oi.seller_id = ?
    ');
    $r2->execute([$sellerId]); $row2 = $r2->fetch();
    $stats['totalOrders']  = (int)$row2['orders'];
    $stats['totalRevenue'] = (float)$row2['revenue'];

    $r3 = $pdo->prepare('
        SELECT COUNT(DISTINCT oi.order_id) as c FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE oi.seller_id = ? AND o.order_status = "pending"
    ');
    $r3->execute([$sellerId]); $row3 = $r3->fetch();
    $stats['pendingOrders'] = (int)$row3['c'];

    // Recent orders
    $r4 = $pdo->prepare('
        SELECT DISTINCT o.id, o.total_amount, o.order_status, o.created_at,
               u.name as customer_name
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        JOIN users u ON u.id = o.user_id
        WHERE oi.seller_id = ?
        ORDER BY o.created_at DESC LIMIT 5
    ');
    $r4->execute([$sellerId]);
    $stats['recentOrders'] = $r4->fetchAll(PDO::FETCH_ASSOC);

    // Seller profile
    $r5 = $pdo->prepare('SELECT * FROM seller_profiles WHERE user_id = ?');
    $r5->execute([$sellerId]);
    $stats['profile'] = $r5->fetch(PDO::FETCH_ASSOC);

    echo json_encode($stats);
    exit;
}

// ── seller products list ──────────────────────────────────────────────────────
if ($action === 'my-products') {
    requireAuth();
    $user = getAuthUser();
    $page  = max(1, intval($_GET['page'] ?? 1));
    $limit = intval($_GET['limit'] ?? 20);
    $offset = ($page - 1) * $limit;

    $stmt = $pdo->prepare('
        SELECT p.*, c.name as category_name, s.name as subcategory_name
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        LEFT JOIN subcategories s ON s.id = p.subcategory_id
        WHERE p.seller_id = ?
        ORDER BY p.id DESC
        LIMIT ? OFFSET ?
    ');
    $stmt->execute([$user['id'], $limit, $offset]);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $countStmt = $pdo->prepare('SELECT COUNT(*) FROM products WHERE seller_id = ?');
    $countStmt->execute([$user['id']]);
    $total = (int)$countStmt->fetchColumn();

    echo json_encode(['products' => $products, 'total' => $total, 'pages' => ceil($total / $limit)]);
    exit;
}

// ── seller add product ────────────────────────────────────────────────────────
if ($action === 'add-product' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    requireAuth();
    $user = getAuthUser();
    if (!in_array($user['role'], ['seller', 'admin'])) {
        http_response_code(403); echo json_encode(['message' => 'Seller access required']); exit;
    }

    $name    = trim($_POST['name'] ?? '');
    $price   = floatval($_POST['price'] ?? 0);
    $stock   = intval($_POST['stock'] ?? 0);
    $catId   = intval($_POST['category_id'] ?? 0);
    if (!$name || !$price || !$catId) {
        http_response_code(400); echo json_encode(['message' => 'Name, price, category required']); exit;
    }

    $imagePath = null;
    if (isset($_FILES['image']) && $_FILES['image']['error'] === 0) {
        $uploadDir = '../uploads/products/';
        $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
        $filename = uniqid() . '_' . time() . '.' . $ext;
        move_uploaded_file($_FILES['image']['tmp_name'], $uploadDir . $filename);
        $imagePath = '/uploads/products/' . $filename;
    }

    $salePrice     = floatval($_POST['sale_price'] ?? 0) ?: null;
    $subId         = intval($_POST['subcategory_id'] ?? 0) ?: null;
    $subSubId      = intval($_POST['sub_subcategory_id'] ?? 0) ?: null;
    $featured      = ($_POST['featured'] ?? '') === 'true' ? 1 : 0;
    $brand         = trim($_POST['brand'] ?? '');
    $description   = trim($_POST['description'] ?? '');
    $meeshoLink    = trim($_POST['meesho_link'] ?? '') ?: null;
    $flipkartLink  = trim($_POST['flipkart_link'] ?? '') ?: null;
    $amazonLink    = trim($_POST['amazon_link'] ?? '') ?: null;

    $stmt = $pdo->prepare('
        INSERT INTO products (name, brand, description, price, sale_price, stock, featured,
            category_id, subcategory_id, sub_subcategory_id, image,
            meesho_link, flipkart_link, amazon_link,
            seller_id, seller_approved, rating, num_reviews, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, 0, 1, NOW())
    ');
    $stmt->execute([
        $name, $brand, $description, $price, $salePrice, $stock, $featured,
        $catId, $subId, $subSubId, $imagePath,
        $meeshoLink, $flipkartLink, $amazonLink,
        $user['id']
    ]);
    $newId = $pdo->lastInsertId();

    // Add extra images
    if (!empty($_FILES['images'])) {
        $uploadDir = '../uploads/products/';
        $files = $_FILES['images'];
        $fileCount = count($files['name']);
        for ($i = 0; $i < $fileCount; $i++) {
            if ($files['error'][$i] !== 0) continue;
            $ext = strtolower(pathinfo($files['name'][$i], PATHINFO_EXTENSION));
            $fname = uniqid() . '_extra_' . $i . '.' . $ext;
            move_uploaded_file($files['tmp_name'][$i], $uploadDir . $fname);
            $imgUrl = '/uploads/products/' . $fname;
            $pdo->prepare('INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)')
                ->execute([$newId, $imgUrl, $i]);
        }
    }
    if ($imagePath) {
        $pdo->prepare('INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, 0)')
            ->execute([$newId, $imagePath]);
    }

    echo json_encode(['message' => 'Product added!', 'id' => $newId]);
    exit;
}

// ── seller delete product ─────────────────────────────────────────────────────
if ($action === 'delete-product' && $_SERVER['REQUEST_METHOD'] === 'DELETE') {
    requireAuth();
    $user = getAuthUser();
    $id = intval($_GET['id'] ?? 0);

    $check = $pdo->prepare('SELECT id FROM products WHERE id = ? AND seller_id = ?');
    $check->execute([$id, $user['id']]);
    if (!$check->fetch()) { http_response_code(403); echo json_encode(['message' => 'Not your product']); exit; }

    $pdo->prepare('DELETE FROM products WHERE id = ?')->execute([$id]);
    echo json_encode(['message' => 'Deleted']);
    exit;
}

// ── seller orders ─────────────────────────────────────────────────────────────
if ($action === 'my-orders') {
    requireAuth();
    $user = getAuthUser();

    $stmt = $pdo->prepare('
        SELECT DISTINCT o.id, o.total_amount, o.order_status, o.payment_status,
               o.payment_method, o.created_at,
               u.name as customer_name, u.email as customer_email, u.phone as customer_phone,
               o.shipping_address, o.city, o.state, o.pincode
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        JOIN users u ON u.id = o.user_id
        WHERE oi.seller_id = ?
        ORDER BY o.created_at DESC
    ');
    $stmt->execute([$user['id']]);
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Attach only this seller\'s items to each order
    foreach ($orders as &$order) {
        $itemStmt = $pdo->prepare('
            SELECT oi.*, p.name, p.image, p.brand
            FROM order_items oi
            LEFT JOIN products p ON p.id = oi.product_id
            WHERE oi.order_id = ? AND oi.seller_id = ?
        ');
        $itemStmt->execute([$order['id'], $user['id']]);
        $order['items'] = $itemStmt->fetchAll(PDO::FETCH_ASSOC);
    }

    echo json_encode($orders);
    exit;
}

// ── seller profile get/update ─────────────────────────────────────────────────
if ($action === 'profile') {
    requireAuth();
    $user = getAuthUser();

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $pdo->prepare('
            SELECT sp.*, u.name, u.email FROM seller_profiles sp
            JOIN users u ON u.id = sp.user_id
            WHERE sp.user_id = ?
        ');
        $stmt->execute([$user['id']]);
        $profile = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode($profile ?: []);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true);
        $pdo->prepare('
            UPDATE seller_profiles SET
                shop_name = ?, shop_description = ?, phone = ?, whatsapp = ?,
                address = ?, city = ?, state = ?, pincode = ?, gst_number = ?
            WHERE user_id = ?
        ')->execute([
            $data['shop_name'] ?? '', $data['shop_description'] ?? '',
            $data['phone'] ?? '', $data['whatsapp'] ?? '',
            $data['address'] ?? '', $data['city'] ?? '',
            $data['state'] ?? '', $data['pincode'] ?? '',
            $data['gst_number'] ?? '', $user['id']
        ]);
        echo json_encode(['message' => 'Profile updated']);
        exit;
    }
}

// ── admin: list all sellers ───────────────────────────────────────────────────
if ($action === 'admin-list') {
    requireAdmin();
    $stmt = $pdo->query('
        SELECT sp.*, u.name, u.email, u.phone as user_phone
        FROM seller_profiles sp
        JOIN users u ON u.id = sp.user_id
        ORDER BY sp.joined_at DESC
    ');
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

// ── admin: approve/suspend seller ────────────────────────────────────────────
if ($action === 'admin-update-status' && $_SERVER['REQUEST_METHOD'] === 'PUT') {
    requireAdmin();
    $data = json_decode(file_get_contents('php://input'), true);
    $sellerId = intval($_GET['id'] ?? 0);
    $status   = $data['status'] ?? '';
    if (!in_array($status, ['approved', 'suspended', 'pending'])) {
        http_response_code(400); echo json_encode(['message' => 'Invalid status']); exit;
    }
    $pdo->prepare("UPDATE seller_profiles SET status = ? WHERE user_id = ?")->execute([$status, $sellerId]);
    if ($status === 'suspended') {
        $pdo->prepare("UPDATE users SET role = 'user' WHERE id = ?")->execute([$sellerId]);
    } elseif ($status === 'approved') {
        $pdo->prepare("UPDATE users SET role = 'seller' WHERE id = ?")->execute([$sellerId]);
    }
    echo json_encode(['message' => 'Seller status updated']);
    exit;
}

http_response_code(404);
echo json_encode(['message' => 'Action not found']);
