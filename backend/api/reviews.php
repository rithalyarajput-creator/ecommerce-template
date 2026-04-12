<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../config/auth.php';

$db = (new Database())->connect();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'POST' && $action === 'add') {
    $user = requireAuth();
    $data = json_decode(file_get_contents("php://input"), true);

    $db->prepare("INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)")
       ->execute([$user['id'], $data['product_id'], $data['rating'], $data['comment'] ?? '']);

    $stmt = $db->prepare("SELECT AVG(rating) as avg_rating, COUNT(*) as num_reviews FROM reviews WHERE product_id = ?");
    $stmt->execute([$data['product_id']]);
    $stats = $stmt->fetch(PDO::FETCH_ASSOC);

    $db->prepare("UPDATE products SET rating = ?, num_reviews = ? WHERE id = ?")
       ->execute([$stats['avg_rating'], $stats['num_reviews'], $data['product_id']]);

    echo json_encode(['message' => 'Review added']);
    exit();
}

if ($method === 'GET' && $action === 'product') {
    $pid = $_GET['product_id'];
    $stmt = $db->prepare("SELECT r.*, u.name as user_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = ? ORDER BY r.created_at DESC");
    $stmt->execute([$pid]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit();
}

http_response_code(404);
echo json_encode(['message' => 'Not found']);
?>
