<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../config/auth.php';

requireAdmin();

$action = $_GET['action'] ?? '';

if ($action === 'import') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['message' => 'POST required']);
        exit;
    }

    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['message' => 'No file uploaded or upload error']);
        exit;
    }

    $file = $_FILES['file'];
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, ['csv'])) {
        http_response_code(400);
        echo json_encode(['message' => 'Only CSV files are supported']);
        exit;
    }

    $tmpPath = $file['tmp_name'];
    $handle = fopen($tmpPath, 'r');
    if (!$handle) {
        http_response_code(500);
        echo json_encode(['message' => 'Cannot read file']);
        exit;
    }

    // Read header row (strip BOM if present)
    $rawHeaders = fgetcsv($handle);
    if (!$rawHeaders) {
        http_response_code(400);
        echo json_encode(['message' => 'Empty file or invalid CSV']);
        exit;
    }
    // Strip UTF-8 BOM from first header
    $rawHeaders[0] = ltrim($rawHeaders[0], "\xEF\xBB\xBF\xef\xbb\xbf");
    $headers = array_map('trim', $rawHeaders);
    $headerMap = array_flip($headers);

    // Required columns
    $required = ['name', 'price', 'stock', 'category_id'];
    foreach ($required as $req) {
        if (!isset($headerMap[$req])) {
            http_response_code(400);
            echo json_encode(['message' => "Missing required column: $req"]);
            exit;
        }
    }

    $db = new Database();
    $pdo = $db->getConnection();

    $success = 0;
    $errors = [];
    $imported = [];
    $rowNum = 1; // header is row 0

    $get = function($row, $col) use ($headerMap) {
        if (!isset($headerMap[$col])) return '';
        $val = $row[$headerMap[$col]] ?? '';
        return trim($val);
    };

    while (($row = fgetcsv($handle)) !== false) {
        $rowNum++;

        // Skip empty rows or note/example rows
        $name = $get($row, 'name');
        if ($name === '' || strpos($name, '*') !== false || strtolower($name) === 'name') continue;

        // Validate required fields
        $price = $get($row, 'price');
        $stock = $get($row, 'stock');
        $categoryId = $get($row, 'category_id');

        if ($name === '') {
            $errors[] = ['row' => $rowNum, 'message' => 'Name is required'];
            continue;
        }
        if (!is_numeric($price) || floatval($price) < 0) {
            $errors[] = ['row' => $rowNum, 'message' => "Invalid price '$price' for '$name'"];
            continue;
        }
        if (!is_numeric($stock)) {
            $errors[] = ['row' => $rowNum, 'message' => "Invalid stock '$stock' for '$name'"];
            continue;
        }
        if (!is_numeric($categoryId)) {
            $errors[] = ['row' => $rowNum, 'message' => "Invalid category_id '$categoryId' for '$name'"];
            continue;
        }

        // Verify category exists
        $catStmt = $pdo->prepare('SELECT id FROM categories WHERE id = ?');
        $catStmt->execute([$categoryId]);
        if (!$catStmt->fetch()) {
            $errors[] = ['row' => $rowNum, 'message' => "Category ID $categoryId not found for '$name'"];
            continue;
        }

        // Optional fields
        $brand = $get($row, 'brand');
        $description = $get($row, 'description');
        $salePrice = $get($row, 'sale_price');
        $salePrice = is_numeric($salePrice) && floatval($salePrice) > 0 ? floatval($salePrice) : null;
        $featured = strtoupper($get($row, 'featured')) === 'YES' ? 1 : 0;
        $subcategoryId = $get($row, 'subcategory_id');
        $subcategoryId = is_numeric($subcategoryId) ? intval($subcategoryId) : null;
        $subSubcategoryId = $get($row, 'sub_subcategory_id');
        $subSubcategoryId = is_numeric($subSubcategoryId) ? intval($subSubcategoryId) : null;
        $meeshoLink = $get($row, 'meesho_link');
        $flipkartLink = $get($row, 'flipkart_link');
        $amazonLink = $get($row, 'amazon_link');

        try {
            $stmt = $pdo->prepare('
                INSERT INTO products
                    (name, brand, description, price, sale_price, stock, featured,
                     category_id, subcategory_id, sub_subcategory_id,
                     meesho_link, flipkart_link, amazon_link,
                     rating, num_reviews, is_active, created_at)
                VALUES
                    (?, ?, ?, ?, ?, ?, ?,
                     ?, ?, ?,
                     ?, ?, ?,
                     0, 0, 1, NOW())
            ');
            $stmt->execute([
                $name, $brand, $description, floatval($price), $salePrice, intval($stock), $featured,
                intval($categoryId), $subcategoryId, $subSubcategoryId,
                $meeshoLink ?: null, $flipkartLink ?: null, $amazonLink ?: null
            ]);
            $newId = $pdo->lastInsertId();
            $success++;
            $imported[] = ['id' => $newId, 'name' => $name];
        } catch (Exception $e) {
            $errors[] = ['row' => $rowNum, 'message' => "DB error for '$name': " . $e->getMessage()];
        }
    }

    fclose($handle);

    echo json_encode([
        'success' => $success,
        'total' => $rowNum - 1,
        'errors' => $errors,
        'imported' => $imported
    ]);
    exit;
}

http_response_code(400);
echo json_encode(['message' => 'Invalid action']);
