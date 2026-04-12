<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../config/auth.php';

$db = (new Database())->connect();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'POST' && $action === 'create') {
    $user = requireAuth();
    $data = json_decode(file_get_contents("php://input"), true);

    $db->beginTransaction();
    try {
        $stmt = $db->prepare("SELECT c.*, p.price, p.sale_price, p.stock FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?");
        $stmt->execute([$user['id']]);
        $cartItems = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($cartItems)) {
            throw new Exception('Cart is empty');
        }

        $total = 0;
        foreach ($cartItems as $item) {
            $price = $item['sale_price'] ?: $item['price'];
            $total += $price * $item['quantity'];
        }

        $stmt = $db->prepare("INSERT INTO orders (user_id, total_amount, shipping_address, city, state, pincode, phone, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $user['id'], $total, $data['shipping_address'], $data['city'],
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

        $db->prepare("DELETE FROM cart WHERE user_id = ?")->execute([$user['id']]);
        $db->commit();

        http_response_code(201);
        echo json_encode(['message' => 'Order placed', 'orderId' => $orderId]);
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
    $stmt = $db->prepare("SELECT o.*, u.name as user_name, u.email as user_email FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC");
    $stmt->execute();
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($orders as &$order) {
        $itemsStmt = $db->prepare("SELECT oi.*, p.name, p.image FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?");
        $itemsStmt->execute([$order['id']]);
        $order['items'] = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);
    }

    echo json_encode($orders);
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

http_response_code(404);
echo json_encode(['message' => 'Not found']);
?>
