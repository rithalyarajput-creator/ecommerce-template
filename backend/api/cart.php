<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../config/auth.php';

$db = (new Database())->connect();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'list';
$user = requireAuth();

if ($method === 'GET' && $action === 'list') {
    $stmt = $db->prepare("SELECT c.id, c.quantity, p.id as product_id, p.name, p.price, p.sale_price, p.image, p.stock FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?");
    $stmt->execute([$user['id']]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit();
}

if ($method === 'POST' && $action === 'add') {
    $data = json_decode(file_get_contents("php://input"), true);
    $pid = $data['product_id'];
    $qty = $data['quantity'] ?? 1;

    $stmt = $db->prepare("SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?");
    $stmt->execute([$user['id'], $pid]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        $stmt = $db->prepare("UPDATE cart SET quantity = quantity + ? WHERE id = ?");
        $stmt->execute([$qty, $existing['id']]);
    } else {
        $stmt = $db->prepare("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)");
        $stmt->execute([$user['id'], $pid, $qty]);
    }
    echo json_encode(['message' => 'Added to cart']);
    exit();
}

if ($method === 'PUT' && $action === 'update') {
    $id = $_GET['id'];
    $data = json_decode(file_get_contents("php://input"), true);
    $qty = $data['quantity'];

    if ($qty <= 0) {
        $db->prepare("DELETE FROM cart WHERE id = ? AND user_id = ?")->execute([$id, $user['id']]);
    } else {
        $db->prepare("UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?")->execute([$qty, $id, $user['id']]);
    }
    echo json_encode(['message' => 'Cart updated']);
    exit();
}

if ($method === 'DELETE' && $action === 'remove') {
    $id = $_GET['id'];
    $db->prepare("DELETE FROM cart WHERE id = ? AND user_id = ?")->execute([$id, $user['id']]);
    echo json_encode(['message' => 'Removed from cart']);
    exit();
}

if ($method === 'DELETE' && $action === 'clear') {
    $db->prepare("DELETE FROM cart WHERE user_id = ?")->execute([$user['id']]);
    echo json_encode(['message' => 'Cart cleared']);
    exit();
}

http_response_code(404);
echo json_encode(['message' => 'Not found']);
?>
