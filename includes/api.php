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
} elseif ($action === 'join_room') {
    $roomCode = $_POST['room_code'] ?? '';
    $playerName = $_POST['player_name'] ?? 'Guest';
    $userId = $_POST['user_id'] ?? null;

    $stmt = $pdo->prepare("SELECT id, text_content, status, game_mode, room_limit FROM rooms WHERE room_code = ?");
    $stmt->execute([$roomCode]);
    $room = $stmt->fetch();

    if ($room) {
        $stmt = $pdo->prepare("INSERT INTO players (room_id, player_name, user_id) VALUES (?, ?, ?)");
        $stmt->execute([$room['id'], $playerName, $userId]);
        $playerId = $pdo->lastInsertId();

        echo json_encode([
            'success' => true,
            'room_id' => $room['id'],
            'player_id' => $playerId,
            'text_content' => $room['text_content'],
            'status' => $room['status'],
            'game_mode' => $room['game_mode'],
            'room_limit' => $room['room_limit']
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Room not found']);
    }
} elseif ($action === 'save_history') {
    $userId = $_POST['user_id'] ?? 0;
    $gameMode = $_POST['game_mode'] ?? '';
    $wpm = $_POST['wpm'] ?? 0;
    $accuracy = $_POST['accuracy'] ?? 0;
    $result = $_POST['result'] ?? 'solo';

    $stmt = $pdo->prepare("INSERT INTO history (user_id, game_mode, wpm, accuracy, result) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$userId, $gameMode, $wpm, $accuracy, $result]);
    echo json_encode(['success' => true]);
} elseif ($action === 'get_history') {
    $userId = $_GET['user_id'] ?? 0;
    $stmt = $pdo->prepare("SELECT game_mode, wpm, accuracy, result, played_at FROM history WHERE user_id = ? ORDER BY played_at DESC LIMIT 10");
    $stmt->execute([$userId]);
    echo json_encode(['success' => true, 'history' => $stmt->fetchAll()]);
} elseif ($action === 'add_friend') {
    $userId = $_POST['user_id'] ?? 0;
    $friendUsername = $_POST['friend_username'] ?? '';

    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$friendUsername]);
    $friend = $stmt->fetch();

    if ($friend) {
        if ($friend['id'] == $userId) {
            echo json_encode(['success' => false, 'message' => '你不能加自己為好友']);
            exit;
        }
        try {
            $stmt = $pdo->prepare("INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, 'accepted')");
            $stmt->execute([$userId, $friend['id']]);
            // Bi-directional friend for simplicity
            $stmt = $pdo->prepare("INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, 'accepted')");
            $stmt->execute([$friend['id'], $userId]);
            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => '已經是好友了或發生錯誤']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => '找不到此使用者']);
    }
} elseif ($action === 'get_friends') {
    $userId = $_GET['user_id'] ?? 0;
    $stmt = $pdo->prepare("SELECT u.username FROM users u JOIN friends f ON u.id = f.friend_id WHERE f.user_id = ?");
    $stmt->execute([$userId]);
    echo json_encode(['success' => true, 'friends' => $stmt->fetchAll()]);
} elseif ($action === 'update_progress') {
    $playerId = $_POST['player_id'] ?? 0;
    $progress = $_POST['progress'] ?? 0;
    $wpm = $_POST['wpm'] ?? 0;
    $accuracy = $_POST['accuracy'] ?? 0;

    $stmt = $pdo->prepare("UPDATE players SET progress = ?, wpm = ?, accuracy = ?, last_active = CURRENT_TIMESTAMP WHERE id = ?");
    $stmt->execute([$progress, $wpm, $accuracy, $playerId]);

    echo json_encode(['success' => true]);
} elseif ($action === 'get_status') {
    $roomId = $_GET['room_id'] ?? 0;
    $playerId = $_GET['player_id'] ?? 0;

    // Get all players in room
    $stmt = $pdo->prepare("SELECT id, player_name, progress, wpm, accuracy FROM players WHERE room_id = ? AND id != ?");
    $stmt->execute([$roomId, $playerId]);
    $opponents = $stmt->fetchAll();

    // Get room status
    $stmt = $pdo->prepare("SELECT status FROM rooms WHERE id = ?");
    $stmt->execute([$roomId]);
    $room = $stmt->fetch();

    echo json_encode([
        'success' => true,
        'opponents' => $opponents,
        'room_status' => $room['status']
    ]);
} elseif ($action === 'start_game') {
    $roomId = $_POST['room_id'] ?? 0;
    $stmt = $pdo->prepare("UPDATE rooms SET status = 'playing' WHERE id = ?");
    $stmt->execute([$roomId]);
    echo json_encode(['success' => true]);
}
?>