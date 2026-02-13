/* 花园保卫战 - 游戏逻辑 */

class WhackAMoleGame {
    constructor() {
        this.score = 0;
        this.hits = 0;
        this.misses = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.timeLeft = 60;
        this.isPlaying = false;
        this.isPaused = false;
        this.gameMode = 'timed';
        this.difficulty = 1;
        this.moleSpeed = 1500;
        this.moleInterval = null;
        this.timerInterval = null;
        this.currentMole = null;
        this.doubleActive = false;
        this.slowActive = false;
        
        this.freezes = 2;
        this.doubles = 1;
        this.slows = 2;
        
        this.progress = {
            highScore: 0,
            totalCarrots: 0,
            totalHits: 0,
            unlockedHammers: ['default']
        };

        this.moleTypes = {
            normal: { emoji: '🐹', points: 1, weight: 60 },
            golden: { emoji: '🌟', points: 3, weight: 25 },
            rainbow: { emoji: '🌈', points: 5, weight: 10 },
            bomb: { emoji: '💣', points: -2, weight: 5 }
        };

        this.characterMessages = {
            welcome: ['你好呀！快来帮我保护花园！', '小地鼠们要来偷吃胡萝卜啦！', '准备好了吗？让我们开始吧！'],
            hit: ['打中了！', '好棒！', '继续加油！', '太厉害了！'],
            miss: ['没关系，继续！', '加油！', '下一只一定行！'],
            combo: ['连击！太棒了！', '哇！连续击中！', '你真厉害！'],
            bomb: ['小心炸弹！', '不要打炸弹哦！', '没关系，继续！'],
            timesUp: ['时间到！你真棒！', '辛苦了！休息一下吧！', '你保护了花园！'],
            encourage: ['加油加油！', '你做得很好！', '慢慢来不着急~']
        };

        this.initElements();
        this.bindEvents();
        this.loadProgress();
        this.updateDisplay();
        this.showStartModal();
        this.initCursor();
    }

    initElements() {
        this.boardEl = document.getElementById('game-board');
        this.scoreEl = document.getElementById('score');
        this.timerEl = document.getElementById('timer');
        this.timerDisplayEl = document.getElementById('timer-display');
        this.hitsEl = document.getElementById('hits');
        this.comboDisplayEl = document.getElementById('combo-display');
        this.characterSpeechEl = document.getElementById('character-speech');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.modeBtns = document.querySelectorAll('.mode-btn');
        this.diffBtns = document.querySelectorAll('.diff-btn');
        this.hammerBtns = document.querySelectorAll('.hammer-btn');
        this.freezeBtn = document.getElementById('freeze-btn');
        this.freezeCountEl = document.getElementById('freeze-count');
        this.doubleBtn = document.getElementById('double-btn');
        this.doubleCountEl = document.getElementById('double-count');
        this.slowBtn = document.getElementById('slow-btn');
        this.slowCountEl = document.getElementById('slow-count');
        this.carrotCountEl = document.getElementById('carrot-count');
        this.highScoreEl = document.getElementById('high-score');
        this.accuracyEl = document.getElementById('accuracy');
        this.modal = document.getElementById('result-modal');
        this.modalEmoji = document.getElementById('modal-emoji');
        this.modalTitle = document.getElementById('modal-title');
        this.modalMessage = document.getElementById('modal-message');
        this.modalScore = document.getElementById('modal-score');
        this.finalHitsEl = document.getElementById('final-hits');
        this.finalComboEl = document.getElementById('final-combo');
        this.finalAccuracyEl = document.getElementById('final-accuracy');
        this.modalReward = document.getElementById('modal-reward');
        this.modalBtn = document.getElementById('modal-btn');
        this.starRating = document.getElementById('star-rating');
        this.startModal = document.getElementById('start-modal');
        this.startModalBtn = document.getElementById('start-modal-btn');
        this.celebrationEl = document.getElementById('celebration');
        this.hitEffectEl = document.getElementById('hit-effect');
        this.cursorHammer = document.getElementById('cursor-hammer');
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.modalBtn.addEventListener('click', () => this.closeModal());
        this.startModalBtn.addEventListener('click', () => this.closeStartModal());

        this.modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.modeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.gameMode = btn.dataset.mode;
                if (this.gameMode === 'endless') {
                    this.timerDisplayEl.style.opacity = '0.5';
                } else {
                    this.timerDisplayEl.style.opacity = '1';
                }
            });
        });

        this.diffBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.diffBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.difficulty = parseInt(btn.dataset.level);
                this.moleSpeed = parseInt(btn.dataset.speed);
            });
        });

        this.hammerBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const hammer = btn.dataset.hammer;
                if (this.progress.unlockedHammers.includes(hammer)) {
                    this.hammerBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.updateCursor();
                }
            });
        });

        this.freezeBtn.addEventListener('click', () => this.useFreeze());
        this.doubleBtn.addEventListener('click', () => this.useDouble());
        this.slowBtn.addEventListener('click', () => this.useSlow());

        document.addEventListener('mousemove', (e) => this.updateCursorPosition(e));
        
        document.addEventListener('touchstart', () => {
            this.cursorHammer.style.display = 'none';
        }, { once: true });
    }

    initCursor() {
        const isTouch = 'ontouchstart' in window;
        if (!isTouch) {
            this.cursorHammer.classList.add('active');
        }
    }

    updateCursorPosition(e) {
        this.cursorHammer.style.left = e.clientX + 'px';
        this.cursorHammer.style.top = e.clientY + 'px';
    }

    updateCursor() {
        const activeHammer = document.querySelector('.hammer-btn.active');
        if (activeHammer) {
            const hammerIcon = activeHammer.querySelector('.hammer-icon').textContent;
            this.cursorHammer.textContent = hammerIcon;
        }
    }

    createBoard() {
        this.boardEl.innerHTML = '';
        
        for (let i = 0; i < 9; i++) {
            const hole = document.createElement('div');
            hole.className = 'mole-hole';
            hole.dataset.index = i;

            const mole = document.createElement('div');
            mole.className = 'mole';
            hole.appendChild(mole);

            hole.addEventListener('click', (e) => this.whack(e, i));
            hole.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.whack(e, i);
            }, { passive: false });

            this.boardEl.appendChild(hole);
        }
    }

    showStartModal() {
        this.startModal.classList.add('show');
        this.createBoard();
    }

    closeStartModal() {
        this.startModal.classList.remove('show');
        this.showCharacterMessage('welcome');
    }

    startGame() {
        this.score = 0;
        this.hits = 0;
        this.misses = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.timeLeft = this.gameMode === 'timed' ? 60 : 999;
        this.isPlaying = true;
        this.isPaused = false;
        this.freezes = 2;
        this.doubles = 1;
        this.slows = 2;
        this.doubleActive = false;
        this.slowActive = false;

        this.createBoard();
        this.updateDisplay();
        
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        
        if (this.gameMode === 'timed') {
            this.startTimer();
        }
        
        this.startMoleSpawning();
        this.playSound('start');
    }

    startTimer() {
        this.stopTimer();
        this.timerInterval = setInterval(() => {
            if (!this.isPaused) {
                this.timeLeft--;
                this.updateTimerDisplay();
                
                if (this.timeLeft <= 0) {
                    this.gameOver();
                }
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimerDisplay() {
        this.timerEl.textContent = this.timeLeft;
        
        this.timerDisplayEl.classList.remove('warning', 'danger');
        if (this.timeLeft <= 10) {
            this.timerDisplayEl.classList.add('danger');
        } else if (this.timeLeft <= 20) {
            this.timerDisplayEl.classList.add('warning');
        }
    }

    startMoleSpawning() {
        this.stopMoleSpawning();
        this.spawnMole();
    }

    stopMoleSpawning() {
        if (this.moleInterval) {
            clearTimeout(this.moleInterval);
            this.moleInterval = null;
        }
    }

    spawnMole() {
        if (!this.isPlaying || this.isPaused) return;

        this.hideCurrentMole();

        const holes = document.querySelectorAll('.mole-hole');
        const randomIndex = Math.floor(Math.random() * holes.length);
        const hole = holes[randomIndex];
        const mole = hole.querySelector('.mole');

        const moleType = this.getRandomMoleType();
        mole.textContent = moleType.emoji;
        mole.dataset.type = Object.keys(this.moleTypes).find(key => this.moleTypes[key] === moleType);
        mole.dataset.points = moleType.points;
        
        mole.classList.remove('hit', 'miss', 'golden', 'rainbow', 'bomb');
        
        if (mole.dataset.type === 'golden') mole.classList.add('golden');
        if (mole.dataset.type === 'rainbow') mole.classList.add('rainbow');
        if (mole.dataset.type === 'bomb') mole.classList.add('bomb');

        mole.classList.add('show');
        this.currentMole = { hole, mole, type: mole.dataset.type };

        const showTime = this.slowActive ? this.moleSpeed * 1.5 : this.moleSpeed;
        
        setTimeout(() => {
            if (mole.classList.contains('show') && !mole.classList.contains('hit')) {
                this.missMole(mole);
            }
        }, showTime);

        const nextSpawn = this.slowActive ? this.moleSpeed * 1.5 : this.moleSpeed;
        this.moleInterval = setTimeout(() => this.spawnMole(), nextSpawn);
    }

    getRandomMoleType() {
        const totalWeight = Object.values(this.moleTypes).reduce((sum, t) => sum + t.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const type of Object.values(this.moleTypes)) {
            random -= type.weight;
            if (random <= 0) return type;
        }
        return this.moleTypes.normal;
    }

    hideCurrentMole() {
        if (this.currentMole && this.currentMole.mole) {
            this.currentMole.mole.classList.remove('show');
        }
        this.currentMole = null;
    }

    whack(e, index) {
        if (!this.isPlaying || this.isPaused) return;

        const hole = document.querySelectorAll('.mole-hole')[index];
        const mole = hole.querySelector('.mole');

        if (!mole.classList.contains('show') || mole.classList.contains('hit')) return;

        this.swingHammer();

        const points = parseInt(mole.dataset.points);
        const type = mole.dataset.type;

        if (type === 'bomb') {
            this.hitBomb(mole, points);
        } else {
            this.hitMole(mole, points);
        }

        const rect = hole.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        this.showHitEffect(x, y, type === 'bomb' ? points : Math.abs(points));
    }

    hitMole(mole, basePoints) {
        mole.classList.add('hit');
        this.hits++;
        this.combo++;
        
        if (this.combo > this.maxCombo) {
            this.maxCombo = this.combo;
        }

        let points = basePoints;
        if (this.doubleActive) points *= 2;
        if (this.combo >= 3) points += Math.floor(this.combo / 3);
        
        this.score += points;
        
        this.updateComboDisplay();
        this.updateDisplay();

        if (this.combo >= 3) {
            this.showCharacterMessage('combo');
            this.createConfetti(10);
        } else {
            this.showCharacterMessage('hit');
        }

        this.playSound('hit');
    }

    hitBomb(mole, points) {
        mole.classList.add('hit');
        
        this.score += points;
        if (this.score < 0) this.score = 0;
        
        this.combo = 0;
        this.updateComboDisplay();
        this.updateDisplay();
        
        this.showCharacterMessage('bomb');
        this.playSound('bomb');
    }

    missMole(mole) {
        if (!mole.classList.contains('show')) return;
        
        mole.classList.add('miss');
        this.misses++;
        this.combo = 0;
        
        this.updateComboDisplay();
        
        setTimeout(() => {
            mole.classList.remove('show', 'miss');
        }, 300);
    }

    swingHammer() {
        this.cursorHammer.classList.add('swing');
        setTimeout(() => {
            this.cursorHammer.classList.remove('swing');
        }, 100);
    }

    showHitEffect(x, y, points) {
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = points > 0 ? `+${points}` : points;
        popup.classList.add(points > 0 ? 'positive' : 'negative');
        if (this.combo >= 3) popup.classList.add('combo');
        
        popup.style.left = x + 'px';
        popup.style.top = y + 'px';
        
        document.body.appendChild(popup);
        
        setTimeout(() => popup.remove(), 800);

        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.className = 'hit-particle';
            particle.textContent = ['✨', '⭐', '💫', '🌟'][Math.floor(Math.random() * 4)];
            particle.style.left = (x + (Math.random() - 0.5) * 50) + 'px';
            particle.style.top = y + 'px';
            particle.style.animationDelay = (Math.random() * 0.2) + 's';
            
            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 500);
        }
    }

    updateComboDisplay() {
        const comboValue = this.comboDisplayEl.querySelector('.combo-value');
        
        if (this.combo >= 2) {
            this.comboDisplayEl.classList.add('active');
            comboValue.textContent = `x${this.combo}`;
        } else {
            this.comboDisplayEl.classList.remove('active');
            comboValue.textContent = 'x1';
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.pauseBtn.querySelector('.btn-icon').textContent = '▶️';
            this.pauseBtn.querySelector('.btn-text').textContent = '继续';
            this.showCharacterMessage('encourage');
        } else {
            this.pauseBtn.querySelector('.btn-icon').textContent = '⏸️';
            this.pauseBtn.querySelector('.btn-text').textContent = '暂停';
        }
    }

    useFreeze() {
        if (this.freezes <= 0 || !this.isPlaying || this.isPaused) return;
        
        this.freezes--;
        this.updateDisplay();
        
        this.isPaused = true;
        this.timerDisplayEl.classList.add('frozen');
        
        this.showCharacterMessage('encourage');
        this.playSound('bonus');
        
        setTimeout(() => {
            this.isPaused = false;
            this.timerDisplayEl.classList.remove('frozen');
        }, 5000);
    }

    useDouble() {
        if (this.doubles <= 0 || !this.isPlaying || this.doubleActive) return;
        
        this.doubles--;
        this.doubleActive = true;
        this.doubleBtn.classList.add('active');
        this.updateDisplay();
        
        this.playSound('bonus');
        
        setTimeout(() => {
            this.doubleActive = false;
            this.doubleBtn.classList.remove('active');
        }, 10000);
    }

    useSlow() {
        if (this.slows <= 0 || !this.isPlaying || this.slowActive) return;
        
        this.slows--;
        this.slowActive = true;
        this.slowBtn.classList.add('active');
        this.updateDisplay();
        
        this.playSound('bonus');
        
        setTimeout(() => {
            this.slowActive = false;
            this.slowBtn.classList.remove('active');
        }, 10000);
    }

    gameOver() {
        this.isPlaying = false;
        this.stopTimer();
        this.stopMoleSpawning();
        this.hideCurrentMole();

        const totalAttempts = this.hits + this.misses;
        const accuracy = totalAttempts > 0 ? Math.round((this.hits / totalAttempts) * 100) : 0;
        
        if (this.score > this.progress.highScore) {
            this.progress.highScore = this.score;
        }
        
        const carrotsEarned = Math.floor(this.score / 10);
        this.progress.totalCarrots += carrotsEarned;
        this.progress.totalHits += this.hits;
        
        this.saveProgress();
        
        let stars = 0;
        if (accuracy >= 80) stars = 3;
        else if (accuracy >= 60) stars = 2;
        else if (accuracy >= 40) stars = 1;

        this.showResult(accuracy, stars, carrotsEarned);
        this.showCharacterMessage('timesUp');
        this.createConfetti(30);
        this.playSound('win');
    }

    showResult(accuracy, stars, carrotsEarned) {
        const messages = [
            { emoji: '🎉', title: '太棒了！', msg: '你保护了花园！' },
            { emoji: '⭐', title: '很厉害！', msg: '继续加油！' },
            { emoji: '😊', title: '做得好！', msg: '下次会更好！' }
        ];
        
        const messageIndex = stars >= 3 ? 0 : stars >= 2 ? 1 : 2;
        
        this.modalEmoji.textContent = messages[messageIndex].emoji;
        this.modalTitle.textContent = messages[messageIndex].title;
        this.modalMessage.textContent = messages[messageIndex].msg;
        
        this.finalHitsEl.textContent = this.hits;
        this.finalComboEl.textContent = this.maxCombo;
        this.finalAccuracyEl.textContent = accuracy + '%';
        this.modalScore.textContent = this.score;

        if (carrotsEarned > 0) {
            this.modalReward.classList.add('show');
            this.modalReward.querySelector('.reward-text').textContent = `获得胡萝卜 x${carrotsEarned}`;
        } else {
            this.modalReward.classList.remove('show');
        }

        const starEls = this.starRating.querySelectorAll('.star');
        starEls.forEach((star, index) => {
            star.classList.remove('active');
            if (index < stars) {
                setTimeout(() => star.classList.add('active'), index * 200);
            }
        });

        this.modal.classList.add('show');
        
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
    }

    closeModal() {
        this.modal.classList.remove('show');
    }

    showCharacterMessage(type) {
        const messages = this.characterMessages[type];
        if (!messages) return;

        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        this.characterSpeechEl.textContent = randomMessage;
    }

    updateDisplay() {
        this.scoreEl.textContent = this.score;
        this.hitsEl.textContent = this.hits;
        this.freezeCountEl.textContent = this.freezes;
        this.doubleCountEl.textContent = this.doubles;
        this.slowCountEl.textContent = this.slows;
        
        this.carrotCountEl.textContent = this.progress.totalCarrots;
        this.highScoreEl.textContent = this.progress.highScore;
        
        const totalAttempts = this.hits + this.misses;
        const accuracy = totalAttempts > 0 ? Math.round((this.hits / totalAttempts) * 100) : 0;
        this.accuracyEl.textContent = accuracy + '%';
        
        this.freezeBtn.disabled = this.freezes <= 0 || !this.isPlaying;
        this.doubleBtn.disabled = this.doubles <= 0 || !this.isPlaying || this.doubleActive;
        this.slowBtn.disabled = this.slows <= 0 || !this.isPlaying || this.slowActive;
    }

    createConfetti(count) {
        const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1A3', '#A06CD5', '#74B9FF'];

        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDelay = Math.random() * 0.5 + 's';
                this.celebrationEl.appendChild(confetti);

                setTimeout(() => confetti.remove(), 3000);
            }, i * 30);
        }
    }

    playSound(type) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            const sounds = {
                hit: { freq: 600, duration: 0.1, type: 'sine' },
                bomb: { freq: 200, duration: 0.2, type: 'square' },
                miss: { freq: 300, duration: 0.1, type: 'triangle' },
                win: { freq: 800, duration: 0.3, type: 'sine' },
                bonus: { freq: 1000, duration: 0.15, type: 'sine' },
                start: { freq: 500, duration: 0.15, type: 'sine' }
            };

            const sound = sounds[type] || sounds.hit;

            oscillator.type = sound.type;
            oscillator.frequency.setValueAtTime(sound.freq, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + sound.duration);
        } catch (e) {
            // Audio not supported
        }
    }

    saveProgress() {
        localStorage.setItem('whackAMoleProgress', JSON.stringify(this.progress));
    }

    loadProgress() {
        const saved = localStorage.getItem('whackAMoleProgress');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.progress = { ...this.progress, ...parsed };
            } catch (e) {
                // Invalid data
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.game = new WhackAMoleGame();

    console.log('%c🌻 花园保卫战已加载！', 'font-size: 20px; color: #4ECDC4;');
    console.log('%c帮小兔子保护花园吧！', 'font-size: 14px; color: #FF6B6B;');
});
