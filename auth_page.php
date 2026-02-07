<?php
require_once 'includes/db.php';
session_start();

$message = '';
$mode = $_GET['mode'] ?? 'login'; // 'login' or 'register'

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'register') {
        $username = trim($_POST['username'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';

        if (empty($username) || empty($email) || empty($password)) {
            $message = '所有欄位均為必填';
            $mode = 'register';
        } else {
            // Check if username already exists
            $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
            $stmt->execute([$username]);
            if ($stmt->fetch()) {
                $message = '此帳號名稱已被使用';
                $mode = 'register';
            } else {
                // Check if email already exists
                $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
                $stmt->execute([$email]);
                if ($stmt->fetch()) {
                    $message = '此 Email 已被註冊';
                    $mode = 'register';
                } else {
                    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
                    try {
                        $stmt = $pdo->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
                        $stmt->execute([$username, $email, $hashedPassword]);

                        $_SESSION['user_id'] = $pdo->lastInsertId();
                        $_SESSION['username'] = $username;
                        header('Location: index.php');
                        exit;
                    } catch (PDOException $e) {
                        $message = '註冊失敗: ' . $e->getMessage();
                        $mode = 'register';
                    }
                }
            }
        }
    } elseif ($action === 'login') {
        $username = $_POST['username'] ?? '';
        $password = $_POST['password'] ?? '';

        $stmt = $pdo->prepare("SELECT id, username, password FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            header('Location: index.php');
            exit;
        } else {
            $message = '帳號或密碼錯誤';
            $mode = 'login';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="zh-TW">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TypeMaster - 登入/註冊</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Outfit:wght@500;700&display=swap"
        rel="stylesheet">
    <style>
        .error-msg {
            background: rgba(239, 68, 68, 0.2);
            color: #ef4444;
            padding: 0.8rem;
            border-radius: 0.5rem;
            margin-bottom: 1rem;
            font-size: 0.9rem;
            border: 1px solid rgba(239, 68, 68, 0.3);
        }
    </style>
</head>

<body style="justify-content: center;">
    <div class="container">
        <header>
            <h1 style="cursor: pointer;" onclick="location.href='index.php'">TypeMaster</h1>
            <p class="subtitle">進入極速英打的世界</p>
        </header>

        <div id="auth-section" class="glass-card" style="max-width: 400px; margin: 2rem auto;">
            <?php if ($message): ?>
                <div class="error-msg">
                    <?php echo htmlspecialchars($message); ?>
                </div>
            <?php endif; ?>

            <!-- Login Form -->
            <div id="login-form" style="<?php echo $mode === 'login' ? '' : 'display: none;'; ?>">
                <h2 style="margin-bottom: 1.5rem;">登入</h2>
                <form method="POST" action="auth_page.php?mode=login">
                    <input type="hidden" name="action" value="login">
                    <input type="text" name="username" placeholder="帳號名稱" required class="btn btn-secondary"
                        style="width: 100%; text-align: left; margin-bottom: 1rem;">
                    <input type="password" name="password" placeholder="密碼" required class="btn btn-secondary"
                        style="width: 100%; text-align: left; margin-bottom: 1rem;">
                    <button type="submit" class="btn btn-primary" style="width: 100%;">登入</button>
                    <p style="margin-top: 1rem; cursor: pointer; color: var(--primary);" onclick="showRegister()">
                        沒有帳號？現在註冊</p>
                </form>
            </div>

            <!-- Register Form -->
            <div id="register-form" style="<?php echo $mode === 'register' ? '' : 'display: none;'; ?>">
                <h2 style="margin-bottom: 1.5rem;">註冊</h2>
                <form method="POST" action="auth_page.php?mode=register">
                    <input type="hidden" name="action" value="register">
                    <input type="text" name="username" placeholder="帳號名稱 (不可更改)" required class="btn btn-secondary"
                        style="width: 100%; text-align: left; margin-bottom: 1rem;">
                    <input type="email" name="email" placeholder="Email" required class="btn btn-secondary"
                        style="width: 100%; text-align: left; margin-bottom: 1rem;">
                    <input type="password" name="password" placeholder="密碼" required class="btn btn-secondary"
                        style="width: 100%; text-align: left; margin-bottom: 1rem;">
                    <button type="submit" class="btn btn-primary" style="width: 100%;">註冊並登入</button>
                    <p style="margin-top: 1rem; cursor: pointer; color: var(--primary);" onclick="showLogin()">已有帳號？返回登入
                    </p>
                </form>
            </div>

            <div style="margin-top: 1.5rem; text-align: center;">
                <a href="index.php"
                    style="color: var(--text-dim); text-decoration: none; font-size: 0.9rem;">回首頁以遊客身份遊玩</a>
            </div>
        </div>
    </div>

    <script>
        function showRegister() {
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('register-form').style.display = 'block';
        }
        function showLogin() {
            document.getElementById('register-form').style.display = 'none';
            document.getElementById('login-form').style.display = 'block';
        }
    </script>
</body>

</html>