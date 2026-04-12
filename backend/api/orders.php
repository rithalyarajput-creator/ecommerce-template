<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../config/auth.php';

$db = (new Database())->connect();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

function applyCoupon($db, $code, $subtotal) {
    if (!$code) return null;
    $stmt = $db->prepare("SELECT * FROM coupons WHERE code = ? AND active = 1");
    $stmt->execute([strtoupper(trim($code))]);
    $c = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$c) return null;

    $today = date('Y-m-d');
    if (!empty($c['valid_from']) && $today < $c['valid_from']) return null;
    if (!empty($c['valid_until']) && $today > $c['valid_until']) return null;
    if (!empty($c['usage_limit']) && intval($c['used_count']) >= intval($c['usage_limit'])) return null;
    if ($subtotal < floatval($c['min_order_amount'])) return null;

    if ($c['discount_type'] === 'percent') {
        $discount = round($subtotal * floatval($c['discount_value']) / 100, 2);
    } else {
        $discount = floatval($c['discount_value']);
    }
    if (!empty($c['max_discount']) && $discount > floatval($c['max_discount'])) $discount = floatval($c['max_discount']);
    if ($discount > $subtotal) $discount = $subtotal;

    return ['code' => $c['code'], 'discount' => $discount, 'id' => $c['id']];
}

if ($method === 'POST' && $action === 'create') {
    $user = requireAuth();
    $data = json_decode(file_get_contents("php://input"), true);

    $db->beginTransaction();
    try {
        $stmt = $db->prepare("SELECT c.*, p.price, p.sale_price, p.stock FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?");
        $stmt->execute([$user['id']]);
        $cartItems = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($cartItems)) throw new Exception('Cart is empty');

        $subtotal = 0;
        foreach ($cartItems as $item) {
            $price = $item['sale_price'] ?: $item['price'];
            $subtotal += $price * $item['quantity'];
        }

        $couponInfo = applyCoupon($db, $data['coupon_code'] ?? '', $subtotal);
        $discount = $couponInfo ? $couponInfo['discount'] : 0;
        $total = $subtotal - $discount;

        $stmt = $db->prepare("INSERT INTO orders (user_id, total_amount, subtotal, discount_amount, coupon_code, shipping_address, city, state, pincode, phone, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $user['id'], $total, $subtotal, $discount,
            $couponInfo ? $couponInfo['code'] : null,
            $data['shipping_address'], $data['city'],
            $data['state'], $data['pincode'], $data['phone'], $data['payment_method'] ?? 'cod'
        ]);
        $orderId = $db->lastInsertId();

        foreach ($cartItems as $item) {
            $price = $item['sale_price'] ?: $item['price'];
            $db->prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)")
               ->execute([$orderId, $item['product_id'], $item['quantity'], $price]);
            $db->prepare("UPDATE products SET stock = stock - ? WHERE id = ?")
               ->execute([$item['quantity'], $item['product_id']]);
        }

        if ($couponInfo) {
            $db->prepare("UPDATE coupons SET used_count = used_count + 1 WHERE id = ?")->execute([$couponInfo['id']]);
        }

        $db->prepare("DELETE FROM cart WHERE user_id = ?")->execute([$user['id']]);
        $db->commit();

        http_response_code(201);
        echo json_encode([
            'message' => 'Order placed',
            'orderId' => $orderId,
            'subtotal' => $subtotal,
            'discount' => $discount,
            'total' => $total
        ]);
    } catch (Exception $e) {
        $db->rollBack();
        http_response_code(500);
        echo json_encode(['message' => $e->getMessage()]);
    }
    exit();
}

if ($method === 'GET' && $action === 'my-orders') {
    $user = requireAuth();
    $stmt = $db->prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->execute([$user['id']]);
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($orders as &$order) {
        $itemsStmt = $db->prepare("SELECT oi.*, p.name, p.image FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?");
        $itemsStmt->execute([$order['id']]);
        $order['items'] = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);
    }

    echo json_encode($orders);
    exit();
}

if ($method === 'GET' && $action === 'all') {
    requireAdmin();
    $from = $_GET['from'] ?? '';
    $to = $_GET['to'] ?? '';
    $status = $_GET['status'] ?? '';
    $search = $_GET['search'] ?? '';

    $sql = "SELECT o.*, u.name as user_name, u.email as user_email FROM orders o JOIN users u ON o.user_id = u.id WHERE 1=1";
    $params = [];
    if ($from) { $sql .= " AND DATE(o.created_at) >= ?"; $params[] = $from; }
    if ($to)   { $sql .= " AND DATE(o.created_at) <= ?"; $params[] = $to; }
    if ($status) { $sql .= " AND o.order_status = ?"; $params[] = $status; }
    if ($search) {
        $sql .= " AND (u.name LIKE ? OR u.email LIKE ? OR o.id = ?)";
        $like = "%$search%";
        $params[] = $like; $params[] = $like; $params[] = intval($search);
    }
    $sql .= " ORDER BY o.created_at DESC";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($orders as &$order) {
        $itemsStmt = $db->prepare("SELECT oi.*, p.name, p.image FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?");
        $itemsStmt->execute([$order['id']]);
        $order['items'] = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);
    }

    echo json_encode($orders);
    exit();
}

// Full order detail including items + user info (for slip)
if ($method === 'GET' && $action === 'detail') {
    $id = intval($_GET['id'] ?? 0);
    $user = getAuthUser();
    if (!$user) { http_response_code(401); echo json_encode(['message' => 'Unauthorized']); exit(); }

    $stmt = $db->prepare("SELECT o.*, u.name as user_name, u.email as user_email FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = ?");
    $stmt->execute([$id]);
    $order = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$order) { http_response_code(404); echo json_encode(['message' => 'Order not found']); exit(); }

    // Users can only see their own orders; admins see everything
    if ($user['role'] !== 'admin' && $order['user_id'] != $user['id']) {
        http_response_code(403); echo json_encode(['message' => 'Forbidden']); exit();
    }

    $itemsStmt = $db->prepare("SELECT oi.*, p.name, p.image, p.brand FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?");
    $itemsStmt->execute([$id]);
    $order['items'] = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($order);
    exit();
}

if ($method === 'PUT' && $action === 'update-status') {
    requireAdmin();
    $id = $_GET['id'];
    $data = json_decode(file_get_contents("php://input"), true);
    $stmt = $db->prepare("UPDATE orders SET order_status = ?, payment_status = ? WHERE id = ?");
    $stmt->execute([$data['order_status'], $data['payment_status'], $id]);
    echo json_encode(['message' => 'Order updated']);
    exit();
}

// Quick confirm endpoint (admin)
if ($method === 'POST' && $action === 'confirm') {
    requireAdmin();
    $id = $_GET['id'];
    $db->prepare("UPDATE orders SET order_status = 'confirmed' WHERE id = ? AND order_status = 'pending'")->execute([$id]);
    echo json_encode(['message' => 'Order confirmed']);
    exit();
}

http_response_code(404);
echo json_encode(['message' => 'Not found']);
?>
