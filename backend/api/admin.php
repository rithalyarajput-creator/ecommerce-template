<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../config/auth.php';

$db = (new Database())->connect();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
requireAdmin();

if ($method === 'GET' && $action === 'dashboard') {
    $users = $db->query("SELECT COUNT(*) as total FROM users WHERE role = 'user'")->fetch()['total'];
    $products = $db->query("SELECT COUNT(*) as total FROM products")->fetch()['total'];
    $orders = $db->query("SELECT COUNT(*) as total FROM orders")->fetch()['total'];
    $revenue = $db->query("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE payment_status = 'paid'")->fetch()['total'];
    $recent = $db->query("SELECT o.*, u.name as user_name FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 10")->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'totalUsers' => intval($users),
        'totalProducts' => intval($products),
        'totalOrders' => intval($orders),
        'totalRevenue' => floatval($revenue),
        'recentOrders' => $recent
    ]);
    exit();
}

if ($method === 'GET' && $action === 'users') {
    $stmt = $db->query("SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit();
}

if ($method === 'DELETE' && $action === 'delete-user') {
    $id = $_GET['id'];
    $db->prepare("DELETE FROM users WHERE id = ? AND role != 'admin'")->execute([$id]);
    echo json_encode(['message' => 'User deleted']);
    exit();
}

http_response_code(404);
echo json_encode(['message' => 'Not found']);
?>
