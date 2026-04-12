<?php
// One-time admin password fix script
// After running this once, DELETE this file for security
require_once 'config/database.php';

$db = (new Database())->connect();
$hashedPassword = password_hash('admin123', PASSWORD_BCRYPT);

$stmt = $db->prepare("UPDATE users SET password = ?, role = 'admin' WHERE email = 'admin@topmtop.com'");
$stmt->execute([$hashedPassword]);

if ($stmt->rowCount() == 0) {
    $stmt = $db->prepare("INSERT INTO users (name, email, password, role) VALUES ('Admin', 'admin@topmtop.com', ?, 'admin')");
    $stmt->execute([$hashedPassword]);
    echo "<h2 style='color:green;font-family:Arial'>✅ Admin created successfully!</h2>";
} else {
    echo "<h2 style='color:green;font-family:Arial'>✅ Admin password updated successfully!</h2>";
}

echo "<div style='font-family:Arial;font-size:16px'>";
echo "<p><strong>Email:</strong> admin@topmtop.com</p>";
echo "<p><strong>Password:</strong> admin123</p>";
echo "<p style='color:red;font-weight:bold'>⚠️ Security: Ab is fix-admin.php file ko DELETE kar dena!</p>";
echo "<br><a href='http://localhost:3000/login' style='background:#e94560;color:white;padding:10px 20px;text-decoration:none;border-radius:5px'>Go to Login Page</a>";
echo "</div>";
?>
