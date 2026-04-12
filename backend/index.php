<?php
require_once 'config/cors.php';
echo json_encode([
    'status' => 'OK',
    'message' => 'TopMTop API is running',
    'version' => '1.0',
    'endpoints' => [
        'auth' => '/api/auth.php',
        'products' => '/api/products.php',
        'categories' => '/api/categories.php',
        'cart' => '/api/cart.php',
        'orders' => '/api/orders.php',
        'wishlist' => '/api/wishlist.php',
        'reviews' => '/api/reviews.php',
        'admin' => '/api/admin.php'
    ]
]);
?>
