<!DOCTYPE html>
<html lang="zh-TW">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TypeMaster - 極速英打對戰</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Outfit:wght@500;700&display=swap"
        rel="stylesheet">
</head>

<body>
    <div class="container">
        <!-- New Canvas for Particles -->
        <canvas id="particle-canvas" style="position:fixed; top:0; left:0; pointer-events:none; z-index:9999;"></canvas>

        <!-- Result Overlay -->
        <div id="result-overlay" class="glass-card"
            style="display:none; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); z-index:10000; width:90%; max-width:500px; text-align:center;">
            <h2 id="result-title" style="font-size:3rem; margin-bottom:1rem;">YOU WIN!</h2>
            <div id="result-stats" style="font-size:1.5rem; margin-bottom:2rem;"></div>
            <button class="btn btn-primary" onclick="location.reload()">再玩一次</button>
        </div>

        <header>
            <h1>TypeMaster</h1>
            <p class="subtitle">提升你的打字速度，與全球玩家即時對戰</p>
                <a href="auth_page.php">login/register</a>
            <div id="auth-status" style="margin-top: 1rem;">
                <!-- Filled by JS -->
            </div>
        </header>

        <div id="app">
            <!-- Profile & Social Section -->
            <div id="profile-section" style="display: none; margin-bottom: 2rem;">
                <div class="mode-selection">
                    <div class="glass-card">
                        <h3>個人對戰歷史</h3>
                        <div id="history-list" style="margin-top: 1rem; max-height: 300px; overflow-y: auto;">
                            <!-- Filled by JS -->
                        </div>
                    </div>
                    <div class="glass-card">
                        <h3>好友系統</h3>
                        <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                            <input type="text" id="friend-search" placeholder="搜尋帳號名稱" class="btn btn-secondary"
                                style="text-align: left; width: 60%;">
                            <button class="btn btn-primary" onclick="Social.addFriend()">加好友</button>
                        </div>
                        <div id="friends-list" style="max-height: 200px; overflow-y: auto;">
                            <!-- Filled by JS -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Landing Page -->
            <div id="landing-page" class="mode-selection">
                <div class="glass-card">
                    <h2>設定模式</h2>
                    <div style="margin: 1rem 0;">
                        <label>模式：</label>
                        <select id="select-mode" class="btn btn-secondary" style="width: auto; padding: 0.5rem;"
                            onchange="Game.updateLimitUI()">
                            <option value="words">字數模式</option>
                            <option value="time">時間模式</option>
                        </select>
                    </div>
                    <div style="margin: 1rem 0;">
                        <label id="limit-label">字數：</label>
                        <select id="select-limit" class="btn btn-secondary" style="width: auto; padding: 0.5rem;">
                            <option value="10">10</option>
                            <option value="30" selected>30</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                    <div id="guest-login-prompt"
                        style="display: none; background: rgba(0, 242, 254, 0.1); padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem; border: 1px dashed var(--primary); text-align: center;">
                        <p style="font-size: 0.9rem; margin-bottom: 0.5rem;">想要保留你的對戰紀錄嗎？</p>
                        <button class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.9rem;"
                            onclick="Auth.showLogin()">立即登入 / 註冊</button>
                    </div>
                    <hr style="border-color: rgba(255,255,255,0.1); margin: 1.5rem 0;">

                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        <button class="btn btn-primary" onclick="Game.startSolo()">開始自主練習</button>

                        <div style="margin-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1rem;">
                            <h3>即時對戰</h3>
                            <p class="subtitle" style="font-size: 0.9rem; margin-bottom: 1rem;">加入朋友的房間或建立新房間</p>
                            <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                                <input type="text" id="room-code" placeholder="房間代碼" class="btn btn-secondary"
                                    style="text-align: left; width: 60%;">
                                <button class="btn btn-primary" onclick="Game.joinRoom()">加入</button>
                            </div>
                            <button class="btn btn-secondary" style="width: 100%;" onclick="Game.createRoom()">建立新房間
                                (使用上方設定)</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Game Interface (Hidden by default) -->
            <div id="game-page" class="glass-card" style="display: none; width: 100%; margin-top: 2rem;">
                <div class="stats-grid">
                    <div class="stat-item">
                        <div id="wpm" class="stat-value">0</div>
                        <div class="stat-label">WPM</div>
                    </div>
                    <div class="stat-item">
                        <div id="accuracy" class="stat-value">100%</div>
                        <div class="stat-label">準確度</div>
                    </div>
                    <div class="stat-item">
                        <div id="timer" class="stat-value">0s</div>
                        <div class="stat-label">時間</div>
                    </div>
                    <div class="stat-item">
                        <div id="progress" class="stat-value">0%</div>
                        <div class="stat-label">進度</div>
                    </div>
                </div>

                <div id="typing-area" class="typing-box">
                    <!-- Text will be inserted here -->
                </div>

                <input type="text" id="type-input" autocomplete="off" autofocus>

                <div id="battle-progress"
                    style="display: none; margin-top: 2rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1.5rem;">
                    <h3>對手進度</h3>
                    <div id="opponents-list">
                        <!-- Opponent progress bars here -->
                    </div>
                </div>

                <div style="text-align: center; margin-top: 1.5rem;">
                    <button class="btn btn-secondary" onclick="location.reload()">回首頁</button>
                </div>
            </div>
        </div>
    </div>

    <footer
        style="margin-top: 3rem; padding: 2rem 0; border-top: 1px solid rgba(255,255,255,0.05); width: 100%; text-align: center;">
        <p style="color: var(--text-dim); font-size: 0.8rem;">&copy; 2026 TypeMaster. All Rights Reserved.</p>
        <div style="margin-top: 0.5rem;">
            <span id="admin-trigger" onclick="Admin.toggleLogin()"
                style="color: rgba(255,255,255,0.1); cursor: pointer; font-size: 0.7rem;">[ Admin Mode ]</span>
        </div>
    </footer>

    <!-- Admin Panel -->
    <div id="admin-panel" class="glass-card"
        style="display: none; position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); width: 90%; max-width: 400px; z-index: 10002;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h3 style="color: var(--accent);">管理者控制台</h3>
            <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 0.8rem;"
                onclick="Admin.close()">關閉</button>
        </div>

        <div id="admin-login-ui">
            <input type="password" id="admin-pwd" placeholder="輸入管理密碼" class="btn btn-secondary"
                style="width: 100%; text-align: left; margin-bottom: 1rem;">
            <button class="btn btn-primary" style="width: 100%;" onclick="Admin.login()">驗證</button>
        </div>

        <div id="admin-controls" style="display: none;">
            <div style="margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between;">
                <span>打字機器人：</span>
                <label class="switch">
                    <input type="checkbox" id="bot-toggle" onchange="Admin.toggleBot()">
                    <span class="slider round"></span>
                </label>
            </div>
            <div style="margin-bottom: 1rem;">
                <label>機器人速度倍數：</label>
                <select id="bot-speed" class="btn btn-secondary" style="width: 100%; margin-top: 0.5rem;"
                    onchange="Admin.updateSpeed()">
                    <option value="1">1x (普通)</option>
                    <option value="2">2x (快速)</option>
                    <option value="4">4x (極速)</option>
                    <option value="8">8x (瘋狂)</option>
                    <option value="20">20x (神速)</option>
                </select>
            </div>
            <p style="font-size: 0.8rem; color: var(--text-dim); text-align: center;">開通後即可在對戰中自動打字</p>
        </div>
    </div>

    <script src="assets/js/auth.js"></script>
    <script src="assets/js/game.js"></script>
</body>

</html>