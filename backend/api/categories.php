<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../config/auth.php';

$db = (new Database())->connect();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'list';

if ($method === 'GET' && $action === 'list') {
    $stmt = $db->prepare("SELECT * FROM categories ORDER BY name");
    $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit();
}

if ($method === 'POST' && $action === 'create') {
    requireAdmin();
    $name = $_POST['name'] ?? '';
    $description = $_POST['description'] ?? '';
    $image = null;

    if (isset($_FILES['image']) && $_FILES['image']['error'] === 0) {
        $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $filename = time() . '.' . $ext;
        move_uploaded_file($_FILES['image']['tmp_name'], '../uploads/' . $filename);
        $image = '/uploads/' . $filename;
    }

    $stmt = $db->prepare("INSERT INTO categories (name, description, image) VALUES (?, ?, ?)");
    $stmt->execute([$name, $description, $image]);
    echo json_encode(['message' => 'Category added', 'id' => $db->lastInsertId()]);
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
