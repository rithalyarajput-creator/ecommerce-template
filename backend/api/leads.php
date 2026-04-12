<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../config/auth.php';

$db = (new Database())->connect();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Public: submit a new lead
if ($method === 'POST' && $action === 'create') {
    $data = json_decode(file_get_contents("php://input"), true);
    $name = trim($data['name'] ?? '');
    $email = trim($data['email'] ?? '');
    $phone = trim($data['phone'] ?? '');

    if (!$name || (!$email && !$phone)) {
        http_response_code(400);
        echo json_encode(['message' => 'Name and email or phone required']);
        exit();
    }

    $productId = !empty($data['product_id']) ? intval($data['product_id']) : null;
    $productName = null;
    if ($productId) {
        $p = $db->prepare("SELECT name FROM products WHERE id = ?");
        $p->execute([$productId]);
        $row = $p->fetch(PDO::FETCH_ASSOC);
        $productName = $row ? $row['name'] : null;
    }

    $stmt = $db->prepare("INSERT INTO leads (name, email, phone, source, product_id, product_name, message) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $name,
        $email ?: null,
        $phone ?: null,
        $data['source'] ?? 'contact',
        $productId,
        $productName,
        $data['message'] ?? ''
    ]);
    http_response_code(201);
    echo json_encode(['message' => 'Thank you! We will contact you soon.', 'id' => $db->lastInsertId()]);
    exit();
}

// Admin-only below
if ($method === 'GET' && $action === 'list') {
    requireAdmin();
    $status = $_GET['status'] ?? '';
    $search = $_GET['search'] ?? '';
    $sql = "SELECT * FROM leads WHERE 1=1";
    $params = [];
    if ($status) { $sql .= " AND status = ?"; $params[] = $status; }
    if ($search) {
        $sql .= " AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)";
        $like = "%$search%";
        $params[] = $like; $params[] = $like; $params[] = $like;
    }
    $sql .= " ORDER BY created_at DESC";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit();
}

if ($method === 'GET' && $action === 'stats') {
    requireAdmin();
    $total = $db->query("SELECT COUNT(*) as t FROM leads")->fetch()['t'];
    $new = $db->query("SELECT COUNT(*) as t FROM leads WHERE status = 'new'")->fetch()['t'];
    $converted = $db->query("SELECT COUNT(*) as t FROM leads WHERE status = 'converted'")->fetch()['t'];
    $today = $db->query("SELECT COUNT(*) as t FROM leads WHERE DATE(created_at) = CURDATE()")->fetch()['t'];
    echo json_encode([
        'total' => intval($total),
        'new' => intval($new),
        'converted' => intval($converted),
        'today' => intval($today)
    ]);
    exit();
}

if ($method === 'PUT' && $action === 'update') {
    requireAdmin();
    $id = $_GET['id'] ?? 0;
    $data = json_decode(file_get_contents("php://input"), true);
    $stmt = $db->prepare("UPDATE leads SET status = ?, notes = ? WHERE id = ?");
    $stmt->execute([$data['status'] ?? 'new', $data['notes'] ?? '', $id]);
    echo json_encode(['message' => 'Lead updated']);
    exit();
}

if ($method === 'DELETE' && $action === 'delete') {
    requireAdmin();
    $id = $_GET['id'] ?? 0;
    $db->prepare("DELETE FROM leads WHERE id = ?")->execute([$id]);
    echo json_encode(['message' => 'Lead deleted']);
    exit();
}

http_response_code(404);
echo json_encode(['message' => 'Not found']);
?>