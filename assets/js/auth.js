const Auth = {
    user: null,

    async checkStatus() {
        try {
            const res = await fetch('includes/auth.php?action=get_current_user');
            const data = await res.json();
            this.user = data.logged_in ? data : null;
            this.updateUI();
            if (this.user) {
                if (location.pathname.includes('auth_page.php')) {
                    location.href = 'index.php';
                }
                Social.loadData();
            }
        } catch (e) {
            console.error("Auth check failed:", e);
            this.updateUI();
        }
    },

    updateUI() {
        const statusDiv = document.getElementById('auth-status');
        const landing = document.getElementById('landing-page');
        const authSection = document.getElementById('auth-section');

        if (this.user) {
            if (statusDiv) statusDiv.innerHTML = `
                <span style="color:var(--primary); font-weight:bold;">${this.user.username}</span> 已登入 
                <button class="btn btn-secondary" style="padding: 0.3rem 0.8rem; font-size: 0.8rem;" onclick="Auth.logout()">登出</button>
            `;
            if (landing) landing.style.display = 'grid';
            if (authSection) authSection.style.display = 'none';
            const profileSection = document.getElementById('profile-section');
            if (profileSection) profileSection.style.display = 'block';
            const guestPrompt = document.getElementById('guest-login-prompt');
            if (guestPrompt) guestPrompt.style.display = 'none';
        } else {
            if (statusDiv) statusDiv.innerHTML = `尚未登入 - <button class="btn btn-primary" style="padding: 0.3rem 0.8rem; font-size: 0.8rem;" onclick="Auth.showLogin()">登入/註冊</button>`;
            if (landing) landing.style.display = 'grid'; // Allow guest play
            const profileSection = document.getElementById('profile-section');
            if (profileSection) profileSection.style.display = 'none';
            const guestPrompt = document.getElementById('guest-login-prompt');
            if (guestPrompt) guestPrompt.style.display = 'block';
        }
    },

    showLogin() {
        location.href = 'auth_page.php';
    },

    toggleForm() {
        const isLogin = document.getElementById('login-form').style.display !== 'none';
        document.getElementById('login-form').style.display = isLogin ? 'none' : 'block';
        document.getElementById('register-form').style.display = isLogin ? 'block' : 'none';
        document.getElementById('auth-title').innerText = isLogin ? '註冊' : '登入';
    },

    async register() {
        const username = document.getElementById('reg-username').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;

        const formData = new FormData();
        formData.append('username', username);
        formData.append('email', email);
        formData.append('password', password);

        const res = await fetch('includes/auth.php?action=register', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
            this.checkStatus();
        } else {
            alert(data.message);
        }
    },

    async login() {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        const res = await fetch('includes/auth.php?action=login', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
            this.checkStatus();
        } else {
            alert(data.message);
        }
    },

    async logout() {
        await fetch('includes/auth.php?action=logout');
        this.user = null;
        this.updateUI();
        location.reload();
    }
};

const Social = {
    async loadData() {
        this.loadHistory();
        this.loadFriends();
    },

    async loadHistory() {
        const res = await fetch(`includes/api.php?action=get_history&user_id=${Auth.user.user_id}`);
        const data = await res.json();
        const list = document.getElementById('history-list');
        list.innerHTML = data.history.map(h => `
            <div style="background:rgba(255,255,255,0.05); padding:0.8rem; border-radius:10px; margin-bottom:0.5rem; font-size:0.9rem;">
                <div style="display:flex; justify-content:space-between;">
                    <span style="color:var(--primary);">${h.game_mode === 'time' ? '時間' : '字數'}</span>
                    <span>${h.played_at.split(' ')[0]}</span>
                </div>
                <div style="margin-top:0.3rem;">
                    WPM: <b>${h.wpm}</b> | 準確度: <b>${h.accuracy}%</b> | 結果: <b style="color:${h.result === 'win' ? 'var(--success)' : (h.result === 'loss' ? 'var(--error)' : 'white')}">${h.result.toUpperCase()}</b>
                </div>
            </div>
        `).join('') || '<p style="color:var(--text-dim);">尚無對戰紀錄</p>';
    },

    async loadFriends() {
        const res = await fetch(`includes/api.php?action=get_friends&user_id=${Auth.user.user_id}`);
        const data = await res.json();
        const list = document.getElementById('friends-list');
        list.innerHTML = data.friends.map(f => `
            <div style="display:flex; align-items:center; gap:0.5rem; background:rgba(255,255,255,0.05); padding:0.5rem; border-radius:10px; margin-bottom:0.5rem;">
                <div style="width:30px; height:30px; border-radius:50%; background:var(--primary); display:flex; align-items:center; justify-content:center; font-size:0.8rem; font-weight:bold;">${f.username[0].toUpperCase()}</div>
                <span>${f.username}</span>
            </div>
        `).join('') || '<p style="color:var(--text-dim);">尚無好友</p>';
    },

    async addFriend() {
        const username = document.getElementById('friend-search').value;
        if (!username) return;

        const formData = new FormData();
        formData.append('user_id', Auth.user.user_id);
        formData.append('friend_username', username);

        const res = await fetch('includes/api.php?action=add_friend', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
            alert("好友已加入！");
            this.loadFriends();
            document.getElementById('friend-search').value = '';
        } else {
            alert(data.message);
        }
    }
};

Auth.checkStatus();
