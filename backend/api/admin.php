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

    // Quick secondary stats
    $leadsTotal = 0; $leadsNew = 0;
    try {
        $leadsTotal = intval($db->query("SELECT COUNT(*) as t FROM leads")->fetch()['t']);
        $leadsNew = intval($db->query("SELECT COUNT(*) as t FROM leads WHERE status = 'new'")->fetch()['t']);
    } catch (Exception $e) {}

    $pendingOrders = intval($db->query("SELECT COUNT(*) as t FROM orders WHERE order_status = 'pending'")->fetch()['t']);
    $todayOrders = intval($db->query("SELECT COUNT(*) as t FROM orders WHERE DATE(created_at) = CURDATE()")->fetch()['t']);
    $todayRevenue = floatval($db->query("SELECT COALESCE(SUM(total_amount), 0) as t FROM orders WHERE DATE(created_at) = CURDATE()")->fetch()['t']);

    echo json_encode([
        'totalUsers' => intval($users),
        'totalProducts' => intval($products),
        'totalOrders' => intval($orders),
        'totalRevenue' => floatval($revenue),
        'totalLeads' => $leadsTotal,
        'newLeads' => $leadsNew,
        'pendingOrders' => $pendingOrders,
        'todayOrders' => $todayOrders,
        'todayRevenue' => $todayRevenue,
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

// Order analytics (cards + chart data)
if ($method === 'GET' && $action === 'order-analytics') {
    $from = $_GET['from'] ?? date('Y-m-d', strtotime('-29 days'));
    $to = $_GET['to'] ?? date('Y-m-d');

    $scope = "WHERE DATE(created_at) BETWEEN ? AND ?";
    $params = [$from, $to];

    $total = $db->prepare("SELECT COUNT(*) as c, COALESCE(SUM(total_amount),0) as rev FROM orders $scope");
    $total->execute($params);
    $t = $total->fetch(PDO::FETCH_ASSOC);

    $statusBreakdown = $db->prepare("SELECT order_status, COUNT(*) as c, COALESCE(SUM(total_amount),0) as rev FROM orders $scope GROUP BY order_status");
    $statusBreakdown->execute($params);

    $daily = $db->prepare("SELECT DATE(created_at) as d, COUNT(*) as c, COALESCE(SUM(total_amount),0) as rev FROM orders $scope GROUP BY DATE(created_at) ORDER BY d ASC");
    $daily->execute($params);

    $paymentBreakdown = $db->prepare("SELECT payment_status, COUNT(*) as c FROM orders $scope GROUP BY payment_status");
    $paymentBreakdown->execute($params);

    echo json_encode([
        'from' => $from,
        'to' => $to,
        'totalOrders' => intval($t['c']),
        'totalRevenue' => floatval($t['rev']),
        'avgOrderValue' => intval($t['c']) > 0 ? round(floatval($t['rev']) / intval($t['c']), 2) : 0,
        'statusBreakdown' => $statusBreakdown->fetchAll(PDO::FETCH_ASSOC),
        'paymentBreakdown' => $paymentBreakdown->fetchAll(PDO::FETCH_ASSOC),
        'daily' => $daily->fetchAll(PDO::FETCH_ASSOC)
    ]);
    exit();
}

// Product analytics
if ($method === 'GET' && $action === 'product-analytics') {
    $total = intval($db->query("SELECT COUNT(*) as t FROM products")->fetch()['t']);
    $inStock = intval($db->query("SELECT COUNT(*) as t FROM products WHERE stock > 0")->fetch()['t']);
    $outOfStock = intval($db->query("SELECT COUNT(*) as t FROM products WHERE stock = 0")->fetch()['t']);
    $lowStock = intval($db->query("SELECT COUNT(*) as t FROM products WHERE stock > 0 AND stock <= 5")->fetch()['t']);
    $featured = intval($db->query("SELECT COUNT(*) as t FROM products WHERE featured = 1")->fetch()['t']);

    $draft = 0;
    try {
        $draft = intval($db->query("SELECT COUNT(*) as t FROM products WHERE draft = 1")->fetch()['t']);
    } catch (Exception $e) {}

    $totalValue = floatval($db->query("SELECT COALESCE(SUM(COALESCE(sale_price, price) * stock), 0) as t FROM products")->fetch()['t']);

    $topSelling = $db->query("
        SELECT p.id, p.name, p.image, p.stock, COALESCE(SUM(oi.quantity), 0) as sold, COALESCE(SUM(oi.quantity * oi.price), 0) as revenue
        FROM products p
        LEFT JOIN order_items oi ON p.id = oi.product_id
        LEFT JOIN orders o ON oi.order_id = o.id
        GROUP BY p.id
        ORDER BY sold DESC
        LIMIT 10
    ")->fetchAll(PDO::FETCH_ASSOC);

    $byCategory = $db->query("
        SELECT c.name as category, COUNT(p.id) as products
        FROM categories c
        LEFT JOIN products p ON p.category_id = c.id
        GROUP BY c.id
        ORDER BY products DESC
    ")->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'total' => $total,
        'inStock' => $inStock,
        'outOfStock' => $outOfStock,
        'lowStock' => $lowStock,
        'featured' => $featured,
        'draft' => $draft,
        'inventoryValue' => $totalValue,
        'topSelling' => $topSelling,
        'byCategory' => $byCategory
    ]);
    exit();
}

http_response_code(404);
echo json_encode(['message' => 'Not found']);
?>
