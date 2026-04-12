<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../config/auth.php';

$db = (new Database())->connect();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Public: validate a coupon code against a given subtotal
if ($method === 'POST' && $action === 'validate') {
    $data = json_decode(file_get_contents("php://input"), true);
    $code = trim(strtoupper($data['code'] ?? ''));
    $subtotal = floatval($data['subtotal'] ?? 0);

    if (!$code) {
        http_response_code(400);
        echo json_encode(['message' => 'Coupon code required']);
        exit();
    }

    $stmt = $db->prepare("SELECT * FROM coupons WHERE code = ? AND active = 1");
    $stmt->execute([$code]);
    $c = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$c) {
        http_response_code(404);
        echo json_encode(['message' => 'Invalid coupon code']);
        exit();
    }

    $today = date('Y-m-d');
    if (!empty($c['valid_from']) && $today < $c['valid_from']) {
        http_response_code(400);
        echo json_encode(['message' => 'Coupon not yet active']);
        exit();
    }
    if (!empty($c['valid_until']) && $today > $c['valid_until']) {
        http_response_code(400);
        echo json_encode(['message' => 'Coupon has expired']);
        exit();
    }
    if (!empty($c['usage_limit']) && intval($c['used_count']) >= intval($c['usage_limit'])) {
        http_response_code(400);
        echo json_encode(['message' => 'Coupon usage limit reached']);
        exit();
    }
    if ($subtotal < floatval($c['min_order_amount'])) {
        http_response_code(400);
        echo json_encode(['message' => 'Minimum order amount Rs.' . floatval($c['min_order_amount']) . ' required']);
        exit();
    }

    if ($c['discount_type'] === 'percent') {
        $discount = round($subtotal * floatval($c['discount_value']) / 100, 2);
    } else {
        $discount = floatval($c['discount_value']);
    }
    if (!empty($c['max_discount']) && $discount > floatval($c['max_discount'])) {
        $discount = floatval($c['max_discount']);
    }
    if ($discount > $subtotal) $discount = $subtotal;

    echo json_encode([
        'code' => $c['code'],
        'description' => $c['description'],
        'discount_type' => $c['discount_type'],
        'discount_value' => floatval($c['discount_value']),
        'discount_amount' => $discount,
        'final_total' => round($subtotal - $discount, 2)
    ]);
    exit();
}

// Public: list active coupons for frontend display
if ($method === 'GET' && $action === 'public') {
    $today = date('Y-m-d');
    $stmt = $db->prepare("SELECT code, description, discount_type, discount_value, min_order_amount, max_discount, valid_until FROM coupons WHERE active = 1 AND (valid_until IS NULL OR valid_until >= ?) AND (valid_from IS NULL OR valid_from <= ?) ORDER BY discount_value DESC");
    $stmt->execute([$today, $today]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit();
}

// Admin only below
if ($method === 'GET' && $action === 'list') {
    requireAdmin();
    $stmt = $db->query("SELECT * FROM coupons ORDER BY created_at DESC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit();
}

if ($method === 'POST' && $action === 'create') {
    requireAdmin();
    $data = json_decode(file_get_contents("php://input"), true);
    $code = strtoupper(trim($data['code'] ?? ''));
    if (!$code || empty($data['discount_value'])) {
        http_response_code(400);
        echo json_encode(['message' => 'Code and discount value required']);
        exit();
    }
    try {
        $stmt = $db->prepare("INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount, usage_limit, valid_from, valid_until, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $code,
            $data['description'] ?? '',
            $data['discount_type'] ?? 'percent',
            floatval($data['discount_value']),
            floatval($data['min_order_amount'] ?? 0),
            !empty($data['max_discount']) ? floatval($data['max_discount']) : null,
            !empty($data['usage_limit']) ? intval($data['usage_limit']) : null,
            !empty($data['valid_from']) ? $data['valid_from'] : null,
            !empty($data['valid_until']) ? $data['valid_until'] : null,
            isset($data['active']) ? intval($data['active']) : 1
        ]);
        echo json_encode(['message' => 'Coupon created', 'id' => $db->lastInsertId()]);
    } catch (PDOException $e) {
        http_response_code(400);
        echo json_encode(['message' => 'Coupon code already exists']);
    }
    exit();
}

if ($method === 'PUT' && $action === 'update') {
    requireAdmin();
    $id = $_GET['id'] ?? 0;
    $data = json_decode(file_get_contents("php://input"), true);
    $stmt = $db->prepare("UPDATE coupons SET description = ?, discount_type = ?, discount_value = ?, min_order_amount = ?, max_discount = ?, usage_limit = ?, valid_from = ?, valid_until = ?, active = ? WHERE id = ?");
    $stmt->execute([
        $data['description'] ?? '',
        $data['discount_type'] ?? 'percent',
        floatval($data['discount_value']),
        floatval($data['min_order_amount'] ?? 0),
        !empty($data['max_discount']) ? floatval($data['max_discount']) : null,
        !empty($data['usage_limit']) ? intval($data['usage_limit']) : null,
        !empty($data['valid_from']) ? $data['valid_from'] : null,
        !empty($data['valid_until']) ? $data['valid_until'] : null,
        isset($data['active']) ? intval($data['active']) : 1,
        $id
    ]);
    echo json_encode(['message' => 'Coupon updated']);
    exit();
}

if ($method === 'DELETE' && $action === 'delete') {
    requireAdmin();
    $id = $_GET['id'] ?? 0;
    $db->prepare("DELETE FROM coupons WHERE id = ?")->execute([$id]);
    echo json_encode(['message' => 'Coupon deleted']);
    exit();
}

http_response_code(404);
echo json_encode(['message' => 'Not found']);
?>