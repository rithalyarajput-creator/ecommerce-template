<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../config/auth.php';

$db = (new Database())->connect();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'list';
$user = requireAuth();

if ($method === 'GET' && $action === 'list') {
    $stmt = $db->prepare("SELECT w.id, p.id as product_id, p.name, p.price, p.sale_price, p.image, p.rating FROM wishlist w JOIN products p ON w.product_id = p.id WHERE w.user_id = ?");
    $stmt->execute([$user['id']]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit();
}

if ($method === 'POST' && $action === 'add') {
    $data = json_decode(file_get_contents("php://input"), true);
    try {
        $stmt = $db->prepare("INSERT IGNORE INTO wishlist (user_id, product_id) VALUES (?, ?)");
        $stmt->execute([$user['id'], $data['product_id']]);
    } catch (Exception $e) {}
    echo json_encode(['message' => 'Added to wishlist']);
    exit();
}

if ($method === 'DELETE' && $action === 'remove') {
    $pid = $_GET['product_id'];
    $db->prepare("DELETE FROM wishlist WHERE user_id = ? AND product_id = ?")->execute([$user['id'], $pid]);
    echo json_encode(['message' => 'Removed']);
    exit();
}

http_response_code(404);
echo json_encode(['message' => 'Not found']);
?>
