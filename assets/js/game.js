const Game = {
    text: "",
    currentIndex: 0,
    startTime: null,
    timerInterval: null,
    errors: 0,
    isBattle: false,
    roomCode: null,
    playerName: "Player",

    texts: [
        "The quick brown fox jumps over the lazy dog. This classic pangram contains every letter of the English alphabet.",
        "Coding is the process of creating instructions for computers to follow. It requires logic, patience, and creativity.",
        "Technology is advancing at an incredible pace, changing how we live, work, and interact with each other every day.",
        "A journey of a thousand miles begins with a single step. Success is not final, failure is not fatal: it is the courage to continue that counts.",
        "Innovation distinguishes between a leader and a follower. Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.",
        "The best way to predict the future is to invent it. Belief in yourself and all that you are. Know that there is something inside you that is greater than any obstacle.",
        "Believe you can and you're halfway there. The only way to do great work is to love what you do. Stay hungry, stay foolish.",
        "Your time is limited, so don't waste it living someone else's life. Don't be trapped by dogma which is living with the results of other people's thinking.",
        "Success is walking from failure to failure with no loss of enthusiasm. Hardships often prepare ordinary people for an extraordinary destiny.",
        "The mind is everything. What you think you become. Peace comes from within. Do not seek it without.",
        "Life is what happens when you're busy making other plans. You only live once, but if you do it right, once is enough.",
        "The purpose of our lives is to be happy. Get busy living or get busy dying. You miss one hundred percent of the shots you don't take.",
        "Stay away from those people who try to disparage your ambitions. Small minds will always do that, but great minds will give you a feeling that you can become great too.",
        "When you give joy to other people, you get more joy in return. You should give a good thought to happiness that you can give out.",
        "The only thing we have to fear is fear itself. Darkness cannot drive out darkness; only light can do that. Hate cannot drive out hate; only love can do that.",
        "Do not go where the path may lead, go instead where there is no path and leave a trail. What lies behind us and what lies before us are tiny matters compared to what lies within us.",
        "The greatest glory in living lies not in never falling, but in rising every time we fall. The future belongs to those who believe in the beauty of their dreams.",
        "Spread love everywhere you go. Let no one ever come to you without leaving happier. Tell me and I forget. Teach me and I remember. Involve me and I learn.",
        "It is during our darkest moments that we must focus to see the light. Whoever is happy will make others happy too.",
        "In the end, it's not the years in your life that count. It's the life in your years. Many of life's failures are people who did not realize how close they were to success when they gave up.",
        "You have brains in your head. You have feet in your shoes. You can steer yourself any direction you choose. You're on your own. And you know what you know. And YOU are the guy who'll decide where to go.",
        "Never let the fear of striking out keep you from playing the game. Money and success don't change people; they merely amplify what is already there.",
        "Your time is limited, so don't waste it living someone else's life. Don't be trapped by dogma which is living with the results of other people's thinking.",
        "Not how long, but how well you have lived is the main thing. If life were predictable it would cease to be life, and be without flavor.",
        "The whole secret of a successful life is to find out what is one's destiny to do, and then do it. In order to write about life first you must live it.",
        "The big lesson in life, baby, is never be scared of anyone or anything. Curiosity about life in all of its aspects, I think, is still the secret of great creative people.",
        "Life is not a problem to be solved, but a reality to be experienced. The unexamined life is not worth living. Turn your wounds into wisdom.",
        "The way I see it, if you want the rainbow, you gotta put up with the rain. Do all the good you can, for all the people you can, in all the ways you can, as long as you ever can.",
        "Don't settle for what life gives you; make life better and build something. Everything negative pressure, challenges is all an opportunity for me to rise.",
        "I like criticism. It makes you strong. You never really learn much from hearing yourself speak. Life imposes things on you that you can't control, but you still have the choice of how you're going to live through this.",
        "Life is never easy. There is work to be done and obligations to be met obligations to truth, to justice, and to liberty.",
        "Live for each second without hesitation. Life is like a coin. You can spend it any way you wish, but you only spend it once.",
        "Keep smiling, because life is a beautiful thing and there's so much to smile about. Health is the greatest gift, contentment the greatest wealth, faithfulness the best relationship.",
        "You have within you right now, everything you need to deal with whatever the world can throw at you.",
        "Everything you've ever wanted is on the other side of fear. Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.",
        "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle."
    ],
    availableIndices: [],
    gameMode: "words",
    gameLimit: 30,

    init() {
        this.input = document.getElementById('type-input');
        this.display = document.getElementById('typing-area');

        // Initialize available indices
        this.resetIndices();

        this.input.addEventListener('input', (e) => this.handleInput(e));
        this.display.addEventListener('click', () => this.input.focus());

        // Prevent default browser shortcuts
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') e.preventDefault();
        });

        this.initParticles();
        this.initFeedback();
    },

    initParticles() {
        const canvas = document.getElementById('particle-canvas');
        const ctx = canvas.getContext('2d');
        let particles = [];

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });

        class Particle {
            constructor(x, y, color) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 4 + 2;
                this.speedX = (Math.random() - 0.5) * 10;
                this.speedY = (Math.random() - 0.5) * 10;
                this.color = color;
                this.alpha = 1;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.alpha -= 0.02;
            }
            draw() {
                ctx.globalAlpha = this.alpha;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        this.spawnParticles = (x, y, isCorrect) => {
            const color = isCorrect ? '#00f2fe' : '#ef4444';
            for (let i = 0; i < 8; i++) {
                particles.push(new Particle(x, y, color));
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
                if (particles[i].alpha <= 0) {
                    particles.splice(i, 1);
                    i--;
                }
            }
            requestAnimationFrame(animate);
        };
        animate();
    },

    initFeedback() {
        const feedback = document.createElement('div');
        feedback.id = 'feedback-msg';
        document.body.appendChild(feedback);

        this.showFeedback = (text, color) => {
            feedback.innerText = text;
            feedback.style.color = color;
            feedback.classList.add('feedback-show');
            setTimeout(() => feedback.classList.remove('feedback-show'), 1000);
        };

        this.motivationalMessages = ["AMAZING!", "GO GO GO!", "SUPER FAST!", "UNSTOPPABLE!", "LEGENDARY!"];
    },

    updateLimitUI() {
        const mode = document.getElementById('select-mode').value;
        const label = document.getElementById('limit-label');
        const select = document.getElementById('select-limit');

        if (mode === 'time') {
            label.innerText = '時間 (秒)：';
            select.innerHTML = `
                <option value="15">15</option>
                <option value="30" selected>30</option>
                <option value="60">60</option>
                <option value="120">120</option>
            `;
        } else {
            label.innerText = '字數：';
            select.innerHTML = `
                <option value="10">10</option>
                <option value="30" selected>30</option>
                <option value="50">50</option>
                <option value="100">100</option>
            `;
        }
    },

    startSolo() {
        this.isBattle = false;
        this.gameMode = document.getElementById('select-mode').value;
        this.gameLimit = parseInt(document.getElementById('select-limit').value);
        this.prepareGame();
    },

    resetIndices() {
        this.availableIndices = Array.from({ length: this.texts.length }, (_, i) => i);
    },

    getRandomText() {
        if (this.availableIndices.length === 0) {
            this.resetIndices();
        }
        const randomIndex = Math.floor(Math.random() * this.availableIndices.length);
        const textIndex = this.availableIndices.splice(randomIndex, 1)[0];
        return this.texts[textIndex];
    },

    prepareGame() {
        let fullText = this.getRandomText();
        if (this.gameMode === 'words') {
            const words = fullText.split(/\s+/);
            this.text = words.slice(0, this.gameLimit).join(' ');
        } else {
            // In time mode, we just provide enough text
            this.text = fullText;
        }

        this.currentIndex = 0;
        this.errors = 0;
        this.startTime = null;
        this.finished = false;
        clearInterval(this.timerInterval);

        document.getElementById('landing-page').style.display = 'none';
        document.getElementById('game-page').style.display = 'block';

        this.renderText();
        this.updateStats();
        this.input.value = '';
        this.input.disabled = false;
        this.input.focus();

        document.getElementById('timer').innerText = this.gameMode === 'time' ? this.gameLimit + 's' : '0s';
    },

    renderText() {
        this.display.innerHTML = this.text.split('').map((char, index) => {
            let className = "char";
            if (index === 0) className += " current";
            return `<span class="${className}">${char}</span>`;
        }).join('');
    },

    handleInput(e) {
        if (this.finished) return;
        if (!this.startTime) {
            this.startTime = Date.now();
            this.startTimer();
        }

        const typedChars = this.input.value.split('');
        const spans = this.display.querySelectorAll('.char');

        // Reset styles for all spans
        spans.forEach(s => s.classList.remove('correct', 'incorrect', 'current'));

        let correctCount = 0;
        let lastCharCorrect = true;
        this.errors = 0;

        typedChars.forEach((char, i) => {
            if (i < this.text.length) {
                if (char === this.text[i]) {
                    spans[i].classList.add('correct');
                    correctCount++;
                } else {
                    spans[i].classList.add('incorrect');
                    this.errors++;
                    lastCharCorrect = false;
                }
            }
        });

        // Trigger particles at cursor position
        if (typedChars.length > 0) {
            const index = typedChars.length - 1;
            if (index < spans.length) {
                const rect = spans[index].getBoundingClientRect();
                this.spawnParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, lastCharCorrect);
            }
        }

        this.currentIndex = typedChars.length;
        if (this.currentIndex < this.text.length) {
            spans[this.currentIndex].classList.add('current');

            // Auto scroll typing box
            const currentChar = spans[this.currentIndex];
            if (currentChar) {
                const box = this.display;
                if (currentChar.offsetTop > box.scrollTop + box.offsetHeight - 50) {
                    box.scrollTop = currentChar.offsetTop - 50;
                }
            }
        }

        this.updateStats();

        // Show random motivation every 20 characters if accuracy is high
        if (this.currentIndex > 0 && this.currentIndex % 30 === 0 && this.errors === 0) {
            const msg = this.motivationalMessages[Math.floor(Math.random() * this.motivationalMessages.length)];
            this.showFeedback(msg, '#f093fb');
        }

        if (this.gameMode === 'words' && this.currentIndex >= this.text.length && this.errors === 0) {
            this.finishGame();
        }
    },

    updateStats() {
        const timeElapsed = this.startTime ? (Date.now() - this.startTime) / 1000 : 0;
        const wpm = timeElapsed > 0 ? Math.round((this.currentIndex / 5) / (timeElapsed / 60)) : 0;
        const accuracy = this.currentIndex > 0 ? Math.round(((this.currentIndex - this.errors) / this.currentIndex) * 100) : 100;

        let progress;
        if (this.gameMode === 'words') {
            progress = Math.round((this.currentIndex / this.text.length) * 100);
        } else {
            // Progress in time mode is time remaining
            const remaining = Math.max(0, this.gameLimit - timeElapsed);
            progress = Math.round(((this.gameLimit - remaining) / this.gameLimit) * 100);
        }

        document.getElementById('wpm').innerText = wpm;
        document.getElementById('accuracy').innerText = accuracy + '%';
        document.getElementById('progress').innerText = Math.min(100, progress) + '%';

        if (this.isBattle) {
            this.syncProgress(progress, wpm, accuracy);
        }
    },

    startTimer() {
        this.timerInterval = setInterval(() => {
            const timeElapsed = (Date.now() - this.startTime) / 1000;

            if (this.gameMode === 'time') {
                const remaining = Math.max(0, this.gameLimit - Math.round(timeElapsed));
                document.getElementById('timer').innerText = remaining + 's';
                if (remaining <= 0) {
                    this.finishGame();
                }
            } else {
                document.getElementById('timer').innerText = Math.round(timeElapsed) + 's';
            }
            this.updateStats();
        }, 500);
    },

    finishGame(isLoser = false) {
        if (this.finished) return;
        this.finished = true;
        clearInterval(this.timerInterval);
        this.input.disabled = true;

        let resultStr = 'solo';
        if (this.isBattle) {
            clearInterval(this.battleInterval);
            this.syncProgress(100, document.getElementById('wpm').innerText, 100);
            resultStr = isLoser ? 'loss' : 'win';
        }

        // Save History if logged in
        if (Auth.user) {
            const formData = new FormData();
            formData.append('user_id', Auth.user.user_id);
            formData.append('game_mode', this.gameMode);
            formData.append('wpm', document.getElementById('wpm').innerText);
            formData.append('accuracy', parseFloat(document.getElementById('accuracy').innerText));
            formData.append('result', resultStr);
            fetch('includes/api.php?action=save_history', { method: 'POST', body: formData }).then(() => Social.loadData());
        }

        const overlay = document.getElementById('result-overlay');
        const title = document.getElementById('result-title');
        const stats = document.getElementById('result-stats');

        if (isLoser) {
            title.innerText = "GAME OVER";
            title.style.color = "var(--error)";
            title.classList.remove('win-text');
        } else {
            title.innerText = "YOU WIN!";
            title.classList.add('win-text');
            for (let i = 0; i < 10; i++) {
                this.spawnParticles(window.innerWidth / 2 + (Math.random() - 0.5) * 200, window.innerHeight / 2 + (Math.random() - 0.5) * 200, true);
            }
        }

        stats.innerHTML = `
            <div>WPM: ${document.getElementById('wpm').innerText}</div>
            <div>準確度: ${document.getElementById('accuracy').innerText}</div>
            <div>時間: ${document.getElementById('timer').innerText}</div>
        `;

        overlay.style.display = 'block';
    },

    // Battle functions
    async createRoom() {
        let name = "Guest";
        if (Auth.user) {
            name = Auth.user.username;
        } else {
            name = prompt("請輸入您的暱稱", "玩家1");
        }
        if (!name) return;
        this.playerName = name;

        this.gameMode = document.getElementById('select-mode').value;
        this.gameLimit = parseInt(document.getElementById('select-limit').value);

        let fullText = this.getRandomText();
        let textContent = fullText;
        if (this.gameMode === 'words') {
            const words = fullText.split(/\s+/);
            if (words.length < this.gameLimit) {
                // If the random text is shorter than limit, use it all, or loop it?
                // For now just use it as is, or maybe we should ensure sentences are long enough.
                textContent = fullText;
            } else {
                textContent = words.slice(0, this.gameLimit).join(' ');
            }
        }

        const formData = new FormData();
        formData.append('text_content', textContent);
        formData.append('game_mode', this.gameMode);
        formData.append('room_limit', this.gameLimit);
        if (Auth.user) {
            formData.append('user_id', Auth.user.user_id);
        }

        const res = await fetch('includes/api.php?action=create_room', { method: 'POST', body: formData });
        const data = await res.json();

        if (data.success) {
            this.roomCode = data.room_code;
            this.joinRoom(this.roomCode); // Auto join the created room
        }
    },

    async joinRoom(code = null) {
        if (!code) {
            code = document.getElementById('room-code').value.toUpperCase();
            if (!code) return alert("請輸入房間代碼");

            if (!Auth.user) {
                const name = prompt("請輸入您的暱稱", "玩家2");
                if (!name) return;
                this.playerName = name;
            } else {
                this.playerName = Auth.user.username;
            }
        }

        const formData = new FormData();
        formData.append('room_code', code);
        formData.append('player_name', this.playerName);
        if (Auth.user) {
            formData.append('user_id', Auth.user.user_id);
        }

        const res = await fetch('includes/api.php?action=join_room', { method: 'POST', body: formData });
        const data = await res.json();

        if (data.success) {
            this.isBattle = true;
            this.roomId = data.room_id;
            this.playerId = data.player_id;
            this.text = data.text_content;
            this.roomCode = code;
            this.gameMode = data.game_mode;
            this.gameLimit = parseInt(data.room_limit);

            document.getElementById('landing-page').style.display = 'none';
            document.getElementById('game-page').style.display = 'block';
            document.getElementById('battle-progress').style.display = 'block';

            this.renderText();
            this.updateStats();

            document.getElementById('timer').innerText = this.gameMode === 'time' ? this.gameLimit + 's' : '0s';

            // Show waiting message
            this.display.innerHTML = `
                <div style="text-align:center">
                    <h3>房間代碼: ${this.roomCode}</h3>
                    <p>模式: ${this.gameMode === 'time' ? '時間' : '字數'} (${this.gameLimit})</p>
                    <p>等待對手中... (至少 2 人)</p>
                    <button class="btn btn-primary" onclick="Game.startGame()">開始對戰</button>
                </div>`;

            this.startBattlePolling();
        } else {
            alert(data.message);
        }
    },

    async startGame() {
        const formData = new FormData();
        formData.append('room_id', this.roomId);
        await fetch('includes/api.php?action=start_game', { method: 'POST', body: formData });
    },

    startBattlePolling() {
        this.battleInterval = setInterval(async () => {
            const res = await fetch(`includes/api.php?action=get_status&room_id=${this.roomId}&player_id=${this.playerId}`);
            const data = await res.json();

            if (data.success) {
                // Check if game should start
                if (data.room_status === 'playing' && !this.startTime) {
                    this.renderText();
                    this.input.value = '';
                    this.input.focus();
                    this.startTime = Date.now();
                    this.startTimer();
                }

                // Update opponent list
                const list = document.getElementById('opponents-list');
                list.innerHTML = data.opponents.map(opp => `
                    <div style="margin-bottom: 1rem;">
                        <div style="display:flex; justify-content:space-between; margin-bottom: 5px;">
                            <span>${opp.player_name}</span>
                            <span>${opp.wpm} WPM</span>
                        </div>
                        <div style="width:100%; height:10px; background:rgba(255,255,255,0.1); border-radius:5px; overflow:hidden;">
                            <div style="width:${opp.progress}%; height:100%; background:var(--accent); transition: width 0.3s ease;"></div>
                        </div>
                    </div>
                `).join('');

                // Check if any opponent finished first
                data.opponents.forEach(opp => {
                    if (opp.progress >= 100 && !this.finished) {
                        this.finishGame(true); // You lost!
                    }
                });
            }
        }, 1000);
    },

    async syncProgress(progress, wpm, accuracy) {
        const formData = new FormData();
        formData.append('player_id', this.playerId);
        formData.append('progress', progress);
        formData.append('wpm', wpm);
        formData.append('accuracy', accuracy);

        await fetch('includes/api.php?action=update_progress', { method: 'POST', body: formData });
    }
};

const Admin = {
    authed: false,
    botActive: false,
    botMultiplier: 1,
    botInterval: null,

    toggleLogin() {
        const panel = document.getElementById('admin-panel');
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    },

    login() {
        const pwd = document.getElementById('admin-pwd').value;
        if (pwd === '0905') {
            this.authed = true;
            document.getElementById('admin-login-ui').style.display = 'none';
            document.getElementById('admin-controls').style.display = 'block';
            Game.showFeedback("已開啟管理模式", "var(--success)");
        } else {
            alert("密碼錯誤");
        }
    },

    toggleBot() {
        this.botActive = document.getElementById('bot-toggle').checked;
        if (this.botActive) {
            this.startBot();
        } else {
            this.stopBot();
        }
    },

    updateSpeed() {
        this.botMultiplier = parseFloat(document.getElementById('bot-speed').value);
        if (this.botActive) {
            this.stopBot();
            this.startBot();
        }
    },

    startBot() {
        if (!this.botActive || Game.finished) return;

        const baseSpeed = 150; // ms per character
        const interval = baseSpeed / this.botMultiplier;

        this.botInterval = setInterval(() => {
            if (Game.finished || !Game.startTime) {
                if (Game.finished) this.stopBot();
                return;
            }

            if (Game.currentIndex < Game.text.length) {
                const char = Game.text[Game.currentIndex];
                Game.input.value += char;
                Game.handleInput();
            } else {
                this.stopBot();
            }
        }, interval);
    },

    stopBot() {
        clearInterval(this.botInterval);
    },

    close() {
        document.getElementById('admin-panel').style.display = 'none';
    }
};

// Hook into Game to stop bot when finished
const originalFinish = Game.finishGame;
Game.finishGame = function (isLoser) {
    Admin.stopBot();
    originalFinish.call(Game, isLoser);
};

// Hook into prepareGame to potentially start bot if enabled
const originalPrepare = Game.prepareGame;
Game.prepareGame = function () {
    originalPrepare.call(Game);
    if (Admin.botActive) {
        // Wait for user to start game (first keystroke or battle start)
        // Bot check is inside Admin.startBot
        Admin.startBot();
    }
};

window.onload = () => Game.init();
