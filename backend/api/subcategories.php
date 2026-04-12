<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../config/auth.php';

$db = (new Database())->connect();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'list';

function saveUploadedImageSub($field = 'image') {
    if (!isset($_FILES[$field]) || $_FILES[$field]['error'] !== 0) return null;
    $ext = pathinfo($_FILES[$field]['name'], PATHINFO_EXTENSION);
    $filename = time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
    $target = '../uploads/' . $filename;
    if (!is_dir('../uploads/')) mkdir('../uploads/', 0777, true);
    if (move_uploaded_file($_FILES[$field]['tmp_name'], $target)) {
        return '/uploads/' . $filename;
    }
    return null;
}

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

// --- Subcategory CRUD ---
if ($method === 'POST' && $action === 'create-sub') {
    requireAdmin();
    $category_id = $_POST['category_id'] ?? 0;
    $name = $_POST['name'] ?? '';
    $description = $_POST['description'] ?? '';
    $image = saveUploadedImageSub('image');

    $stmt = $db->prepare("INSERT INTO subcategories (category_id, name, description, image) VALUES (?, ?, ?, ?)");
    $stmt->execute([$category_id, $name, $description, $image]);
    echo json_encode(['message' => 'Subcategory added', 'id' => $db->lastInsertId()]);
    exit();
}

if ($method === 'POST' && $action === 'update-sub') {
    requireAdmin();
    $id = $_GET['id'] ?? 0;
    $name = $_POST['name'] ?? '';
    $description = $_POST['description'] ?? '';
    $image = saveUploadedImageSub('image');

    if ($image) {
        $db->prepare("UPDATE subcategories SET name = ?, description = ?, image = ? WHERE id = ?")->execute([$name, $description, $image, $id]);
    } else {
        $db->prepare("UPDATE subcategories SET name = ?, description = ? WHERE id = ?")->execute([$name, $description, $id]);
    }
    echo json_encode(['message' => 'Subcategory updated']);
    exit();
}

if ($method === 'DELETE' && $action === 'delete-sub') {
    requireAdmin();
    $id = $_GET['id'];
    $db->prepare("DELETE FROM subcategories WHERE id = ?")->execute([$id]);
    echo json_encode(['message' => 'Subcategory deleted']);
    exit();
}

// --- Sub-subcategory CRUD ---
if ($method === 'POST' && $action === 'create-sub-sub') {
    requireAdmin();
    $subcategory_id = $_POST['subcategory_id'] ?? 0;
    $name = $_POST['name'] ?? '';
    $description = $_POST['description'] ?? '';
    $image = saveUploadedImageSub('image');

    $stmt = $db->prepare("INSERT INTO sub_subcategories (subcategory_id, name, description, image) VALUES (?, ?, ?, ?)");
    $stmt->execute([$subcategory_id, $name, $description, $image]);
    echo json_encode(['message' => 'Sub-subcategory added', 'id' => $db->lastInsertId()]);
    exit();
}

if ($method === 'POST' && $action === 'update-sub-sub') {
    requireAdmin();
    $id = $_GET['id'] ?? 0;
    $name = $_POST['name'] ?? '';
    $description = $_POST['description'] ?? '';
    $image = saveUploadedImageSub('image');

    if ($image) {
        $db->prepare("UPDATE sub_subcategories SET name = ?, description = ?, image = ? WHERE id = ?")->execute([$name, $description, $image, $id]);
    } else {
        $db->prepare("UPDATE sub_subcategories SET name = ?, description = ? WHERE id = ?")->execute([$name, $description, $id]);
    }
    echo json_encode(['message' => 'Sub-subcategory updated']);
    exit();
}

if ($method === 'DELETE' && $action === 'delete-sub-sub') {
    requireAdmin();
    $id = $_GET['id'];
    $db->prepare("DELETE FROM sub_subcategories WHERE id = ?")->execute([$id]);
    echo json_encode(['message' => 'Sub-subcategory deleted']);
    exit();
}

http_response_code(404);
echo json_encode(['message' => 'Not found']);
?>
