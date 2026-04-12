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
    $stmt = $db->prepare("SELECT p.*, c.name as category_name, s.name as subcategory_name, ss.name as sub_subcategory_name FROM products p LEFT JOIN categories c ON p.category_id = c.id LEFT JOIN subcategories s ON p.subcategory_id = s.id LEFT JOIN sub_subcategories ss ON p.sub_subcategory_id = ss.id WHERE p.id = ?");
    $stmt->execute([$id]);
    $product = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$product) { http_response_code(404); echo json_encode(['message' => 'Not found']); exit(); }

    $imgStmt = $db->prepare("SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order ASC");
    $imgStmt->execute([$id]);
    $product['images'] = $imgStmt->fetchAll(PDO::FETCH_COLUMN);

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
    $subcategory_id = $_POST['subcategory_id'] ?? null;
    $sub_subcategory_id = $_POST['sub_subcategory_id'] ?? null;
    $stock = $_POST['stock'] ?? 0;
    $featured = isset($_POST['featured']) && $_POST['featured'] === 'true' ? 1 : 0;
    $brand = $_POST['brand'] ?? '';
    $meesho_link = $_POST['meesho_link'] ?? '';
    $flipkart_link = $_POST['flipkart_link'] ?? '';
    $amazon_link = $_POST['amazon_link'] ?? '';

    $image = null;
    if (isset($_FILES['image']) && $_FILES['image']['error'] === 0) {
        $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $filename = time() . '_' . rand(1000, 9999) . '.' . $ext;
        move_uploaded_file($_FILES['image']['tmp_name'], '../uploads/' . $filename);
        $image = '/uploads/' . $filename;
    }

    $stmt = $db->prepare("INSERT INTO products (name, description, price, sale_price, category_id, subcategory_id, sub_subcategory_id, image, stock, featured, brand, meesho_link, flipkart_link, amazon_link) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$name, $description, $price, $sale_price ?: null, $category_id ?: null, $subcategory_id ?: null, $sub_subcategory_id ?: null, $image, $stock, $featured, $brand, $meesho_link, $flipkart_link, $amazon_link]);
    $productId = $db->lastInsertId();

    // Handle additional images
    if (isset($_FILES['images'])) {
        $files = $_FILES['images'];
        $count = is_array($files['name']) ? count($files['name']) : 0;
        for ($i = 0; $i < $count; $i++) {
            if ($files['error'][$i] === 0) {
                $ext = pathinfo($files['name'][$i], PATHINFO_EXTENSION);
                $filename = time() . '_' . rand(1000, 9999) . '_' . $i . '.' . $ext;
                move_uploaded_file($files['tmp_name'][$i], '../uploads/' . $filename);
                $imgStmt = $db->prepare("INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)");
                $imgStmt->execute([$productId, '/uploads/' . $filename, $i]);
            }
        }
    }

    echo json_encode(['message' => 'Product added', 'id' => $productId]);
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
    $subcategory_id = $_POST['subcategory_id'] ?? null;
    $sub_subcategory_id = $_POST['sub_subcategory_id'] ?? null;
    $stock = $_POST['stock'] ?? 0;
    $featured = isset($_POST['featured']) && $_POST['featured'] === 'true' ? 1 : 0;
    $brand = $_POST['brand'] ?? '';
    $meesho_link = $_POST['meesho_link'] ?? '';
    $flipkart_link = $_POST['flipkart_link'] ?? '';
    $amazon_link = $_POST['amazon_link'] ?? '';

    if (isset($_FILES['image']) && $_FILES['image']['error'] === 0) {
        $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $filename = time() . '_' . rand(1000, 9999) . '.' . $ext;
        move_uploaded_file($_FILES['image']['tmp_name'], '../uploads/' . $filename);
        $image = '/uploads/' . $filename;
        $stmt = $db->prepare("UPDATE products SET name=?, description=?, price=?, sale_price=?, category_id=?, subcategory_id=?, sub_subcategory_id=?, image=?, stock=?, featured=?, brand=?, meesho_link=?, flipkart_link=?, amazon_link=? WHERE id=?");
        $stmt->execute([$name, $description, $price, $sale_price ?: null, $category_id ?: null, $subcategory_id ?: null, $sub_subcategory_id ?: null, $image, $stock, $featured, $brand, $meesho_link, $flipkart_link, $amazon_link, $id]);
    } else {
        $stmt = $db->prepare("UPDATE products SET name=?, description=?, price=?, sale_price=?, category_id=?, subcategory_id=?, sub_subcategory_id=?, stock=?, featured=?, brand=?, meesho_link=?, flipkart_link=?, amazon_link=? WHERE id=?");
        $stmt->execute([$name, $description, $price, $sale_price ?: null, $category_id ?: null, $subcategory_id ?: null, $sub_subcategory_id ?: null, $stock, $featured, $brand, $meesho_link, $flipkart_link, $amazon_link, $id]);
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

if ($method === 'GET' && $action === 'list-images') {
    $productId = $_GET['product_id'] ?? 0;
    $stmt = $db->prepare("SELECT id, image_url, sort_order FROM product_images WHERE product_id = ? ORDER BY sort_order ASC");
    $stmt->execute([$productId]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit();
}

if ($method === 'DELETE' && $action === 'delete-image') {
    requireAdmin();
    $imgId = $_GET['image_id'] ?? 0;
    $stmt = $db->prepare("DELETE FROM product_images WHERE id = ?");
    $stmt->execute([$imgId]);
    echo json_encode(['message' => 'Image deleted']);
    exit();
}

if ($method === 'POST' && $action === 'set-primary-image') {
    requireAdmin();
    $productId = $_GET['product_id'] ?? 0;
    $imageUrl = $_POST['image_url'] ?? '';
    $stmt = $db->prepare("UPDATE products SET image = ? WHERE id = ?");
    $stmt->execute([$imageUrl, $productId]);
    echo json_encode(['message' => 'Primary image updated']);
    exit();
}

if ($method === 'POST' && $action === 'add-images') {
    requireAdmin();
    $productId = $_GET['product_id'] ?? 0;
    $added = 0;
    if (isset($_FILES['images'])) {
        $files = $_FILES['images'];
        $count = is_array($files['name']) ? count($files['name']) : 0;

        $stmt = $db->prepare("SELECT COALESCE(MAX(sort_order), -1) + 1 as next FROM product_images WHERE product_id = ?");
        $stmt->execute([$productId]);
        $nextOrder = $stmt->fetch(PDO::FETCH_ASSOC)['next'];

        for ($i = 0; $i < $count; $i++) {
            if ($files['error'][$i] === 0) {
                $ext = pathinfo($files['name'][$i], PATHINFO_EXTENSION);
                $filename = time() . '_' . rand(1000, 9999) . '_' . $i . '.' . $ext;
                if (move_uploaded_file($files['tmp_name'][$i], '../uploads/' . $filename)) {
                    $imgStmt = $db->prepare("INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)");
                    $imgStmt->execute([$productId, '/uploads/' . $filename, $nextOrder + $i]);
                    $added++;
                }
            }
        }
    }
    echo json_encode(['message' => "Added $added images"]);
    exit();
}

http_response_code(404);
echo json_encode(['message' => 'Not found']);
?>
