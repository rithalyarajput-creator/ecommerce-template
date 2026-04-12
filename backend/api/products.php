<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../config/auth.php';

$db = (new Database())->connect();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'list';

if ($method === 'GET' && $action === 'list') {
    $page = intval($_GET['page'] ?? 1);
    $limit = intval($_GET['limit'] ?? 12);
    $offset = ($page - 1) * $limit;
    $category = $_GET['category'] ?? '';
    $search = $_GET['search'] ?? '';
    $sort = $_GET['sort'] ?? '';

    $query = "SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1";
    $params = [];

    if ($category) { $query .= " AND p.category_id = ?"; $params[] = $category; }
    if ($search) { $query .= " AND (p.name LIKE ? OR p.description LIKE ?)"; $params[] = "%$search%"; $params[] = "%$search%"; }

    if ($sort === 'price_low') $query .= " ORDER BY p.price ASC";
    elseif ($sort === 'price_high') $query .= " ORDER BY p.price DESC";
    elseif ($sort === 'rating') $query .= " ORDER BY p.rating DESC";
    else $query .= " ORDER BY p.created_at DESC";

    $countStmt = $db->prepare(str_replace("p.*, c.name as category_name", "COUNT(*) as total", explode(" ORDER BY", $query)[0]));
    $countStmt->execute($params);
    $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

    $query .= " LIMIT $limit OFFSET $offset";
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['products' => $products, 'total' => $total, 'page' => $page, 'totalPages' => ceil($total / $limit)]);
    exit();
}

if ($method === 'GET' && $action === 'featured') {
    $stmt = $db->prepare("SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.featured = 1 LIMIT 8");
    $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit();
}

if ($method === 'GET' && $action === 'detail') {
    $id = $_GET['id'] ?? 0;
    $stmt = $db->prepare("SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?");
    $stmt->execute([$id]);
    $product = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$product) { http_response_code(404); echo json_encode(['message' => 'Not found']); exit(); }

    $rev = $db->prepare("SELECT r.*, u.name as user_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = ? ORDER BY r.created_at DESC");
    $rev->execute([$id]);
    $product['reviews'] = $rev->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($product);
    exit();
}

if ($method === 'POST' && $action === 'create') {
    requireAdmin();
    $name = $_POST['name'] ?? '';
    $description = $_POST['description'] ?? '';
    $price = $_POST['price'] ?? 0;
    $sale_price = $_POST['sale_price'] ?? null;
    $category_id = $_POST['category_id'] ?? null;
    $stock = $_POST['stock'] ?? 0;
    $featured = isset($_POST['featured']) && $_POST['featured'] === 'true' ? 1 : 0;

    $image = null;
    if (isset($_FILES['image']) && $_FILES['image']['error'] === 0) {
        $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $filename = time() . '.' . $ext;
        move_uploaded_file($_FILES['image']['tmp_name'], '../uploads/' . $filename);
        $image = '/uploads/' . $filename;
    }

    $stmt = $db->prepare("INSERT INTO products (name, description, price, sale_price, category_id, image, stock, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$name, $description, $price, $sale_price ?: null, $category_id ?: null, $image, $stock, $featured]);
    echo json_encode(['message' => 'Product added', 'id' => $db->lastInsertId()]);
    exit();
}

if ($method === 'POST' && $action === 'update') {
    requireAdmin();
    $id = $_GET['id'] ?? 0;
    $name = $_POST['name'] ?? '';
    $description = $_POST['description'] ?? '';
    $price = $_POST['price'] ?? 0;
    $sale_price = $_POST['sale_price'] ?? null;
    $category_id = $_POST['category_id'] ?? null;
    $stock = $_POST['stock'] ?? 0;
    $featured = isset($_POST['featured']) && $_POST['featured'] === 'true' ? 1 : 0;

    if (isset($_FILES['image']) && $_FILES['image']['error'] === 0) {
        $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $filename = time() . '.' . $ext;
        move_uploaded_file($_FILES['image']['tmp_name'], '../uploads/' . $filename);
        $image = '/uploads/' . $filename;
        $stmt = $db->prepare("UPDATE products SET name=?, description=?, price=?, sale_price=?, category_id=?, image=?, stock=?, featured=? WHERE id=?");
        $stmt->execute([$name, $description, $price, $sale_price ?: null, $category_id ?: null, $image, $stock, $featured, $id]);
    } else {
        $stmt = $db->prepare("UPDATE products SET name=?, description=?, price=?, sale_price=?, category_id=?, stock=?, featured=? WHERE id=?");
        $stmt->execute([$name, $description, $price, $sale_price ?: null, $category_id ?: null, $stock, $featured, $id]);
    }
    echo json_encode(['message' => 'Product updated']);
    exit();
}

if ($method === 'DELETE' && $action === 'delete') {
    requireAdmin();
    $id = $_GET['id'] ?? 0;
    $stmt = $db->prepare("DELETE FROM products WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['message' => 'Product deleted']);
    exit();
}

http_response_code(404);
echo json_encode(['message' => 'Not found']);
?>
