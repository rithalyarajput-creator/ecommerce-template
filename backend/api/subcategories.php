<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../config/auth.php';

$db = (new Database())->connect();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'list';

if ($method === 'GET' && $action === 'list') {
    $cat = $_GET['category_id'] ?? null;
    if ($cat) {
        $stmt = $db->prepare("SELECT * FROM subcategories WHERE category_id = ? ORDER BY name");
        $stmt->execute([$cat]);
    } else {
        $stmt = $db->query("SELECT * FROM subcategories ORDER BY name");
    }
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit();
}

if ($method === 'GET' && $action === 'sub-sub') {
    $sub = $_GET['subcategory_id'] ?? null;
    if ($sub) {
        $stmt = $db->prepare("SELECT * FROM sub_subcategories WHERE subcategory_id = ? ORDER BY name");
        $stmt->execute([$sub]);
    } else {
        $stmt = $db->query("SELECT * FROM sub_subcategories ORDER BY name");
    }
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit();
}

if ($method === 'POST' && $action === 'create-sub') {
    requireAdmin();
    $category_id = $_POST['category_id'] ?? 0;
    $name = $_POST['name'] ?? '';
    $description = $_POST['description'] ?? '';
    $stmt = $db->prepare("INSERT INTO subcategories (category_id, name, description) VALUES (?, ?, ?)");
    $stmt->execute([$category_id, $name, $description]);
    echo json_encode(['message' => 'Added', 'id' => $db->lastInsertId()]);
    exit();
}

if ($method === 'POST' && $action === 'create-sub-sub') {
    requireAdmin();
    $subcategory_id = $_POST['subcategory_id'] ?? 0;
    $name = $_POST['name'] ?? '';
    $description = $_POST['description'] ?? '';
    $stmt = $db->prepare("INSERT INTO sub_subcategories (subcategory_id, name, description) VALUES (?, ?, ?)");
    $stmt->execute([$subcategory_id, $name, $description]);
    echo json_encode(['message' => 'Added', 'id' => $db->lastInsertId()]);
    exit();
}

if ($method === 'DELETE' && $action === 'delete-sub') {
    requireAdmin();
    $id = $_GET['id'];
    $db->prepare("DELETE FROM subcategories WHERE id = ?")->execute([$id]);
    echo json_encode(['message' => 'Deleted']);
    exit();
}

if ($method === 'DELETE' && $action === 'delete-sub-sub') {
    requireAdmin();
    $id = $_GET['id'];
    $db->prepare("DELETE FROM sub_subcategories WHERE id = ?")->execute([$id]);
    echo json_encode(['message' => 'Deleted']);
    exit();
}

http_response_code(404);
echo json_encode(['message' => 'Not found']);
?>
