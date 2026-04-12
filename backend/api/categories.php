<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../config/auth.php';

$db = (new Database())->connect();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'list';

function saveUploadedImage($field = 'image') {
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
    $stmt = $db->prepare("SELECT * FROM categories ORDER BY name");
    $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit();
}

// Full tree with counts - for admin tab
if ($method === 'GET' && $action === 'tree') {
    $cats = $db->query("SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) AS product_count FROM categories c ORDER BY c.name")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($cats as &$c) {
        $subStmt = $db->prepare("SELECT s.*, (SELECT COUNT(*) FROM products p WHERE p.subcategory_id = s.id) AS product_count FROM subcategories s WHERE s.category_id = ? ORDER BY s.name");
        $subStmt->execute([$c['id']]);
        $subs = $subStmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($subs as &$s) {
            $ssStmt = $db->prepare("SELECT ss.*, (SELECT COUNT(*) FROM products p WHERE p.sub_subcategory_id = ss.id) AS product_count FROM sub_subcategories ss WHERE ss.subcategory_id = ? ORDER BY ss.name");
            $ssStmt->execute([$s['id']]);
            $s['sub_subcategories'] = $ssStmt->fetchAll(PDO::FETCH_ASSOC);
        }
        $c['subcategories'] = $subs;
    }
    echo json_encode($cats);
    exit();
}

if ($method === 'POST' && $action === 'create') {
    requireAdmin();
    $name = $_POST['name'] ?? '';
    $description = $_POST['description'] ?? '';
    $image = saveUploadedImage('image');

    $stmt = $db->prepare("INSERT INTO categories (name, description, image) VALUES (?, ?, ?)");
    $stmt->execute([$name, $description, $image]);
    echo json_encode(['message' => 'Category added', 'id' => $db->lastInsertId()]);
    exit();
}

if ($method === 'POST' && $action === 'update') {
    requireAdmin();
    $id = $_GET['id'] ?? 0;
    $name = $_POST['name'] ?? '';
    $description = $_POST['description'] ?? '';
    $image = saveUploadedImage('image');

    if ($image) {
        $db->prepare("UPDATE categories SET name = ?, description = ?, image = ? WHERE id = ?")->execute([$name, $description, $image, $id]);
    } else {
        $db->prepare("UPDATE categories SET name = ?, description = ? WHERE id = ?")->execute([$name, $description, $id]);
    }
    echo json_encode(['message' => 'Category updated']);
    exit();
}

if ($method === 'DELETE' && $action === 'delete') {
    requireAdmin();
    $id = $_GET['id'] ?? 0;
    $stmt = $db->prepare("DELETE FROM categories WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['message' => 'Category deleted']);
    exit();
}

http_response_code(404);
echo json_encode(['message' => 'Not found']);
?>
