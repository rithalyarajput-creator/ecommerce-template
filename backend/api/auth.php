<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../config/auth.php';

$db = (new Database())->connect();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'POST' && $action === 'register') {
    $data = json_decode(file_get_contents("php://input"), true);
    $name = $data['name'] ?? '';
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    $phone = $data['phone'] ?? null;

    if (!$name || !$email || !$password) {
        http_response_code(400);
        echo json_encode(['message' => 'All fields required']);
        exit();
    }

    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['message' => 'Email already registered']);
        exit();
    }

    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $db->prepare("INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)");
    $stmt->execute([$name, $email, $hashedPassword, $phone]);

    $userId = $db->lastInsertId();
    $user = ['id' => $userId, 'name' => $name, 'email' => $email, 'role' => 'user'];
    $token = generateToken($user);

    http_response_code(201);
    echo json_encode(['message' => 'Registered successfully', 'token' => $token, 'user' => $user]);
    exit();
}

if ($method === 'POST' && $action === 'login') {
    $data = json_decode(file_get_contents("php://input"), true);
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    $stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !password_verify($password, $user['password'])) {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid email or password']);
        exit();
    }

    $userData = ['id' => $user['id'], 'name' => $user['name'], 'email' => $user['email'], 'role' => $user['role']];
    $token = generateToken($userData);
    echo json_encode(['message' => 'Login successful', 'token' => $token, 'user' => $userData]);
    exit();
}

if ($method === 'GET' && $action === 'profile') {
    $authUser = requireAuth();
    $stmt = $db->prepare("SELECT id, name, email, phone, address, city, state, pincode, role FROM users WHERE id = ?");
    $stmt->execute([$authUser['id']]);
    echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
    exit();
}

if ($method === 'PUT' && $action === 'profile') {
    $authUser = requireAuth();
    $data = json_decode(file_get_contents("php://input"), true);
    $stmt = $db->prepare("UPDATE users SET name=?, phone=?, address=?, city=?, state=?, pincode=? WHERE id=?");
    $stmt->execute([
        $data['name'] ?? '', $data['phone'] ?? '', $data['address'] ?? '',
        $data['city'] ?? '', $data['state'] ?? '', $data['pincode'] ?? '', $authUser['id']
    ]);
    echo json_encode(['message' => 'Profile updated']);
    exit();
}

http_response_code(404);
echo json_encode(['message' => 'Not found']);
?>
