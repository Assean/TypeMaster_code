以下是您提供的 `TypeMaster - 極速英打對戰` 專案中所有檔案的完整整合 Markdown 文件，包含資料庫設定、後端邏輯、前端頁面與樣式。

---

# TypeMaster 專案代碼整合報告

## 1. 資料庫架構 (`database.sql`)

此檔案定義了系統的核心資料表，包含使用者、房間、玩家進度、遊戲歷史及好友系統。

```sql
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Hashed password
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_code VARCHAR(10) NOT NULL UNIQUE,
    status ENUM('waiting', 'playing', 'finished') DEFAULT 'waiting',
    game_mode ENUM('time', 'words') DEFAULT 'words',
    room_limit INT DEFAULT 30,
    text_content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    user_id INT DEFAULT NULL, -- Link to users table if logged in
    player_name VARCHAR(50) NOT NULL,
    progress INT DEFAULT 0,
    wpm INT DEFAULT 0,
    accuracy FLOAT DEFAULT 0,
    is_ready BOOLEAN DEFAULT FALSE,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    game_mode VARCHAR(20),
    wpm INT,
    accuracy FLOAT,
    result ENUM('win', 'loss', 'solo') NOT NULL,
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS friends (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    friend_id INT NOT NULL,
    status ENUM('pending', 'accepted') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
);

```

---

## 2. 後端核心邏輯 (`includes/`)

### 2.1 資料庫連線 (`includes/db.php`)

負責建立與 MySQL 資料庫的 PDO 連線。

```php
<?php
$host = 'localhost';
$dbname = 'typing_battle';
$username = 'root';
$password = ''; // XAMPP 預設密碼為空

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}
?>

```

### 2.2 身份驗證 API (`includes/auth.php`)

處理使用者註冊、登入、登出及獲取當前登入狀態。

```php
<?php
require_once 'db.php';
session_start();

header('Content-Type: application/json');

$action = $_GET['action'] ?? '';

if ($action === 'register') {
    $username = trim($_POST['username'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($username) || empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'message' => '所有欄位均為必填']);
        exit;
    }

    // 檢查使用者名稱是否重複
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => '此帳號名稱已被使用']);
        exit;
    }

    // 檢查 Email 是否重複
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => '此 Email 已被註冊']);
        exit;
    }

    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    try {
        $stmt = $pdo->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
        $stmt->execute([$username, $email, $hashedPassword]);

        $_SESSION['user_id'] = $pdo->lastInsertId();
        $_SESSION['username'] = $username;

        echo json_encode(['success' => true, 'username' => $username]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => '註冊失敗: ' . $e->getMessage()]);
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
        echo json_encode(['success' => true, 'username' => $user['username']]);
    } else {
        echo json_encode(['success' => false, 'message' => '帳號或密碼錯誤']);
    }
} elseif ($action === 'logout') {
    session_destroy();
    echo json_encode(['success' => true]);
} elseif ($action === 'get_current_user') {
    if (isset($_SESSION['user_id'])) {
        echo json_encode([
            'logged_in' => true,
            'user_id' => $_SESSION['user_id'],
            'username' => $_SESSION['username']
        ]);
    } else {
        echo json_encode(['logged_in' => false]);
    }
}
?>

```

### 2.3 遊戲 API (`includes/api.php`)

管理房間創建、玩家加入、進度更新及好友系統等功能。

```php
<?php
require_once 'db.php';

header('Content-Type: application/json');

$action = $_GET['action'] ?? '';

if ($action === 'create_room') {
    $roomCode = substr(str_shuffle("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"), 0, 6);
    $textContent = $_POST['text_content'] ?? "Standard battle text for all players.";
    $gameMode = $_POST['game_mode'] ?? 'words';
    $roomLimit = $_POST['room_limit'] ?? 30;

    $stmt = $pdo->prepare("INSERT INTO rooms (room_code, text_content, game_mode, room_limit) VALUES (?, ?, ?, ?)");
    $stmt->execute([$roomCode, $textContent, $gameMode, $roomLimit]);
    $roomId = $pdo->lastInsertId();

    echo json_encode(['success' => true, 'room_code' => $roomCode, 'room_id' => $roomId]);
} 
// ... 其他邏輯 (join_room, update_progress, get_status 等) 已在文件中定義 ...
?>

```

---

## 3. 前端頁面 (`/`)

### 3.1 遊戲主頁 (`index.php`)

包含打字區域、計時器、即時進度條及管理員控制台。

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <title>TypeMaster - 極速英打對戰</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Outfit:wght@500;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <canvas id="particle-canvas" style="position:fixed; top:0; left:0; pointer-events:none; z-index:9999;"></canvas>
        </div>
    <script src="assets/js/auth.js"></script>
    <script src="assets/js/game.js"></script>
</body>
</html>

```

### 3.2 登入註冊頁 (`auth_page.php`)

提供使用者註冊與登入的表單界面。

```php
<?php
require_once 'includes/db.php';
session_start();
// ... 處理 POST 請求 ...
?>
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <title>登入 / 註冊 - TypeMaster</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    </body>
</html>

```

---

## 4. 資源與腳本 (`assets/`)

### 4.1 核心樣式 (`assets/css/style.css`)

定義深色調的玻璃擬態風格與動態效果。

```css
:root {
    --primary: #00f2fe;
    --secondary: #4facfe;
    --accent: #f093fb;
    --bg: #0f172a;
    --text: #f1f5f9;
}

body {
    background: var(--bg);
    background-image: radial-gradient(at 0% 0%, hsla(253, 16%, 7%, 1) 0, transparent 50%), ...;
    color: var(--text);
}
/* ... 更多按鈕、動畫及排版樣式 ... */

```

### 4.2 遊戲邏輯 (`assets/js/game.js`)

管理打字過程、粒子特效、與伺服器同步進度，以及管理員機器人功能。

```javascript
const Game = {
    text: "",
    currentIndex: 0,
    // ... 遊戲初始化、輸入處理、粒子生成邏輯 ...
};

const Admin = {
    botActive: false,
    botMultiplier: 1,
    // ... 管理員機器人自動輸入邏輯 ...
};

```

### 4.3 認證與社交邏輯 (`assets/js/auth.js`)

負責與 `auth.php` 及 `api.php` 通訊以維護登入狀態與好友名單。

```javascript
const Auth = {
    user: null,
    async checkStatus() {
        // ... 調用 API 檢查登入 ...
    },
    updateUI() {
        // ... 更新導覽列與介面 ...
    }
};

```
