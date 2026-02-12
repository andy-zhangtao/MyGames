/* 记忆翻翻乐 - 游戏逻辑 */

class MemoryFlipGame {
    constructor() {
        this.currentLevel = 1;
        this.currentTheme = 'forest';
        this.gridSize = { rows: 2, cols: 3 };
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.totalPairs = 0;
        this.score = 0;
        this.moves = 0;
        this.hints = 3;
        this.isLocked = false;
        this.combo = 0;
        
        this.progress = {
            highScore: 0,
            totalStars: 0,
            puzzlePieces: [],
            unlockedLevels: [1],
            unlockedThemes: ['forest']
        };

        this.themes = {
            forest: {
                name: '森林',
                emoji: '🌲',
                cards: ['🐶', '🐱', '🐰', '🐻', '🦊', '🐼', '🐨', '🦁', '🐯', '🐸', '🐵', '🦋']
            },
            space: {
                name: '太空',
                emoji: '🚀',
                cards: ['🌟', '🌙', '☀️', '🪐', '🚀', '👽', '🛸', '☄️', '🌌', '🔭', '🛰️', '👨‍🚀']
            },
            ocean: {
                name: '海洋',
                emoji: '🌊',
                cards: ['🐠', '🐙', '🦀', '🐬', '🐳', '🦈', '🐠', '🐡', '🦐', '🐚', '🦑', '🦭']
            },
            fruit: {
                name: '水果',
                emoji: '🍎',
                cards: ['🍎', '🍊', '🍋', '🍇', '🍓', '🍑', '🍒', '🥝', '🍌', '🍉', '🥭', '🍐']
            }
        };

        this.levels = {
            1: { rows: 2, cols: 3, name: '入门', stars: { 3: 8, 2: 12, 1: 16 } },
            2: { rows: 3, cols: 4, name: '简单', stars: { 3: 14, 2: 20, 1: 28 } },
            3: { rows: 4, cols: 4, name: '中等', stars: { 3: 20, 2: 28, 1: 36 } },
            4: { rows: 4, cols: 5, name: '困难', stars: { 3: 28, 2: 38, 1: 48 } },
            5: { rows: 6, cols: 4, name: '大师', stars: { 3: 32, 2: 44, 1: 56 } }
        };

        this.characterMessages = {
            welcome: ['你好呀！我是小狐狸，来帮我找回朋友们吧！', '准备好了吗？让我们开始冒险！'],
            match: ['太棒了！找到一对！', '你真厉害！', '继续加油！', '好眼力！'],
            combo: ['连续配对！你太强了！', '哇！连击！', '无人能挡！'],
            wrong: ['没关系，再试试！', '加油，你可以的！', '仔细想想~'],
            win: ['太厉害了！你找到了所有朋友！', '你是记忆大师！', '我们成功了！'],
            encourage: ['别灰心，继续加油！', '我相信你！', '慢慢来，不着急~']
        };

        this.initElements();
        this.bindEvents();
        this.loadProgress();
        this.updateCollectionDisplay();
        this.updateDifficultyButtons();
        this.startNewGame();
    }

    initElements() {
        this.boardEl = document.getElementById('game-board');
        this.scoreEl = document.getElementById('score');
        this.movesEl = document.getElementById('moves');
        this.matchedEl = document.getElementById('matched');
        this.totalEl = document.getElementById('total');
        this.hintCountEl = document.getElementById('hint-count');
        this.characterSpeechEl = document.getElementById('character-speech');
        this.characterPanelEl = document.getElementById('character-panel');
        this.restartBtn = document.getElementById('restart-btn');
        this.hintBtn = document.getElementById('hint-btn');
        this.diffBtns = document.querySelectorAll('.diff-btn');
        this.themeBtns = document.querySelectorAll('.theme-btn');
        this.modal = document.getElementById('result-modal');
        this.modalEmoji = document.getElementById('modal-emoji');
        this.modalTitle = document.getElementById('modal-title');
        this.modalMessage = document.getElementById('modal-message');
        this.modalScore = document.getElementById('modal-score');
        this.finalMovesEl = document.getElementById('final-moves');
        this.finalStarsEl = document.getElementById('final-stars');
        this.modalReward = document.getElementById('modal-reward');
        this.modalBtn = document.getElementById('modal-btn');
        this.celebrationEl = document.getElementById('celebration');
        this.puzzleCountEl = document.getElementById('puzzle-count');
        this.highScoreEl = document.getElementById('high-score');
        this.totalStarsEl = document.getElementById('total-stars');
        this.unlockModal = document.getElementById('unlock-modal');
        this.unlockMessage = document.getElementById('unlock-message');
        this.unlockBtn = document.getElementById('unlock-btn');
    }

    bindEvents() {
        this.restartBtn.addEventListener('click', () => this.startNewGame());
        this.hintBtn.addEventListener('click', () => this.showHint());
        this.modalBtn.addEventListener('click', () => this.closeModal());
        this.unlockBtn.addEventListener('click', () => this.closeUnlockModal());

        this.diffBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const level = parseInt(btn.dataset.level);
                if (this.progress.unlockedLevels.includes(level)) {
                    this.diffBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.currentLevel = level;
                    const [rows, cols] = btn.dataset.size.split(',').map(Number);
                    this.gridSize = { rows, cols };
                    this.startNewGame();
                }
            });
        });

        this.themeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                if (this.progress.unlockedThemes.includes(theme)) {
                    this.themeBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.currentTheme = theme;
                    this.startNewGame();
                }
            });
        });
    }

    startNewGame() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.combo = 0;
        this.isLocked = false;
        this.hints = 3;

        const levelConfig = this.levels[this.currentLevel];
        this.gridSize = { rows: levelConfig.rows, cols: levelConfig.cols };
        this.totalPairs = (this.gridSize.rows * this.gridSize.cols) / 2;

        this.updateDisplay();
        this.generateCards();
        this.renderBoard();
        this.showCharacterMessage('welcome');
        this.playSound('start');
    }

    generateCards() {
        const theme = this.themes[this.currentTheme];
        const availableCards = [...theme.cards];
        const pairsNeeded = this.totalPairs;
        
        const selectedCards = [];
        for (let i = 0; i < pairsNeeded; i++) {
            const randomIndex = Math.floor(Math.random() * availableCards.length);
            selectedCards.push(availableCards[randomIndex]);
        }

        const cardPairs = [...selectedCards, ...selectedCards];
        this.shuffleArray(cardPairs);

        this.cards = cardPairs.map((emoji, index) => ({
            id: index,
            emoji: emoji,
            isFlipped: false,
            isMatched: false
        }));
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    renderBoard() {
        this.boardEl.innerHTML = '';
        this.boardEl.style.gridTemplateColumns = `repeat(${this.gridSize.cols}, 1fr)`;

        this.cards.forEach((card, index) => {
            const cardEl = this.createCardElement(card, index);
            this.boardEl.appendChild(cardEl);
            
            setTimeout(() => {
                cardEl.classList.add('spawning');
            }, index * 50);
        });
    }

    createCardElement(card, index) {
        const cardEl = document.createElement('div');
        cardEl.className = 'memory-card';
        cardEl.dataset.index = index;
        cardEl.dataset.emoji = card.emoji;

        cardEl.innerHTML = `
            <div class="memory-card-inner">
                <div class="memory-card-front"></div>
                <div class="memory-card-back" data-theme="${this.currentTheme}">${card.emoji}</div>
            </div>
        `;

        cardEl.addEventListener('click', () => this.handleCardClick(index));
        cardEl.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleCardClick(index);
        }, { passive: false });

        return cardEl;
    }

    handleCardClick(index) {
        if (this.isLocked) return;

        const card = this.cards[index];
        if (card.isFlipped || card.isMatched) return;

        this.flipCard(index);
        this.playSound('flip');

        this.flippedCards.push(index);

        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateDisplay();
            this.checkForMatch();
        }
    }

    flipCard(index) {
        this.cards[index].isFlipped = true;
        const cardEl = this.boardEl.querySelector(`[data-index="${index}"]`);
        if (cardEl) {
            cardEl.classList.add('flipped');
        }
    }

    unflipCards() {
        this.flippedCards.forEach(index => {
            this.cards[index].isFlipped = false;
            const cardEl = this.boardEl.querySelector(`[data-index="${index}"]`);
            if (cardEl) {
                cardEl.classList.add('wrong');
                setTimeout(() => {
                    cardEl.classList.remove('flipped', 'wrong');
                }, 800);
            }
        });
        this.playSound('wrong');
        this.showCharacterMessage('wrong');
    }

    checkForMatch() {
        this.isLocked = true;
        const [first, second] = this.flippedCards;
        const card1 = this.cards[first];
        const card2 = this.cards[second];

        if (card1.emoji === card2.emoji) {
            this.handleMatch(first, second);
        } else {
            this.combo = 0;
            setTimeout(() => {
                this.unflipCards();
                this.flippedCards = [];
                this.isLocked = false;
            }, 600);
        }
    }

    handleMatch(first, second) {
        this.cards[first].isMatched = true;
        this.cards[second].isMatched = true;
        this.matchedPairs++;
        this.combo++;

        const cardEl1 = this.boardEl.querySelector(`[data-index="${first}"]`);
        const cardEl2 = this.boardEl.querySelector(`[data-index="${second}"]`);

        if (cardEl1) cardEl1.classList.add('matched');
        if (cardEl2) cardEl2.classList.add('matched');

        const baseScore = 10;
        const comboBonus = this.combo > 1 ? this.combo * 5 : 0;
        const earnedScore = baseScore + comboBonus;
        this.score += earnedScore;

        this.playSound('match');
        
        if (this.combo >= 2) {
            this.showCharacterMessage('combo');
            this.createConfetti(15);
            this.playSound('combo');
        } else {
            this.showCharacterMessage('match');
        }

        this.flippedCards = [];
        this.isLocked = false;
        this.updateDisplay();

        if (this.matchedPairs === this.totalPairs) {
            setTimeout(() => this.handleWin(), 500);
        }
    }

    handleWin() {
        this.playSound('win');
        this.createConfetti(50);
        this.showCharacterMessage('win');

        const levelConfig = this.levels[this.currentLevel];
        let stars = 0;
        if (this.moves <= levelConfig.stars[3]) {
            stars = 3;
        } else if (this.moves <= levelConfig.stars[2]) {
            stars = 2;
        } else if (this.moves <= levelConfig.stars[1]) {
            stars = 1;
        }

        const earnedStars = Math.max(0, stars);
        this.progress.totalStars += earnedStars;

        if (this.score > this.progress.highScore) {
            this.progress.highScore = this.score;
        }

        const puzzleReward = this.tryGetPuzzlePiece();
        this.unlockNextLevel();

        this.showResult(earnedStars, puzzleReward);
        this.saveProgress();
        this.updateCollectionDisplay();
    }

    tryGetPuzzlePiece() {
        if (this.progress.puzzlePieces.length >= 12) return false;
        
        const chance = 0.3 + (this.currentLevel * 0.1);
        if (Math.random() < chance) {
            let newPiece;
            do {
                newPiece = Math.floor(Math.random() * 12) + 1;
            } while (this.progress.puzzlePieces.includes(newPiece));
            
            this.progress.puzzlePieces.push(newPiece);
            return true;
        }
        return false;
    }

    unlockNextLevel() {
        const nextLevel = this.currentLevel + 1;
        if (nextLevel <= 5 && !this.progress.unlockedLevels.includes(nextLevel)) {
            const starsNeeded = nextLevel * 3;
            if (this.progress.totalStars >= starsNeeded) {
                this.progress.unlockedLevels.push(nextLevel);
                
                const newThemes = ['space', 'ocean', 'fruit'];
                const themeIndex = nextLevel - 2;
                if (themeIndex >= 0 && themeIndex < newThemes.length) {
                    if (!this.progress.unlockedThemes.includes(newThemes[themeIndex])) {
                        this.progress.unlockedThemes.push(newThemes[themeIndex]);
                    }
                }
                
                setTimeout(() => {
                    this.showUnlockMessage(nextLevel);
                }, 2000);
            }
        }
        this.updateDifficultyButtons();
    }

    updateDifficultyButtons() {
        this.diffBtns.forEach(btn => {
            const level = parseInt(btn.dataset.level);
            if (this.progress.unlockedLevels.includes(level)) {
                btn.classList.remove('locked');
            } else {
                btn.classList.add('locked');
            }
        });

        this.themeBtns.forEach(btn => {
            const theme = btn.dataset.theme;
            if (this.progress.unlockedThemes.includes(theme)) {
                btn.classList.remove('locked');
            } else {
                btn.classList.add('locked');
            }
        });
    }

    showHint() {
        if (this.hints <= 0 || this.isLocked) return;

        const unmatchedCards = this.cards.filter(c => !c.isMatched && !c.isFlipped);
        if (unmatchedCards.length < 2) return;

        const firstCard = unmatchedCards[0];
        const matchingCard = unmatchedCards.find(c => 
            c.id !== firstCard.id && c.emoji === firstCard.emoji
        );

        if (matchingCard) {
            this.hints--;
            this.updateDisplay();
            this.playSound('hint');

            [firstCard.id, matchingCard.id].forEach(index => {
                const cardEl = this.boardEl.querySelector(`[data-index="${index}"]`);
                if (cardEl) {
                    cardEl.classList.add('hint');
                    setTimeout(() => cardEl.classList.remove('hint'), 2000);
                }
            });
        }
    }

    showCharacterMessage(type) {
        const messages = this.characterMessages[type];
        if (!messages) return;

        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        this.characterSpeechEl.textContent = randomMessage;
        this.characterSpeechEl.classList.add('talking');
        
        setTimeout(() => {
            this.characterSpeechEl.classList.remove('talking');
        }, 300);
    }

    showResult(stars, puzzleReward) {
        const starText = '⭐'.repeat(stars) || '继续努力！';
        
        this.modalEmoji.textContent = stars === 3 ? '🎉' : stars === 2 ? '😊' : '👍';
        this.modalTitle.textContent = stars === 3 ? '完美！' : stars === 2 ? '很棒！' : '不错！';
        this.modalMessage.textContent = `你在 ${this.moves} 步内完成了游戏！`;
        this.finalMovesEl.textContent = this.moves;
        this.finalStarsEl.textContent = starText;
        this.modalScore.textContent = `+${this.score}`;

        if (puzzleReward) {
            this.modalReward.classList.add('show');
        } else {
            this.modalReward.classList.remove('show');
        }

        this.modal.classList.add('show');
    }

    showUnlockMessage(level) {
        const levelName = this.levels[level].name;
        this.unlockMessage.textContent = `${levelName}模式已解锁！`;
        this.unlockModal.classList.add('show');
    }

    closeModal() {
        this.modal.classList.remove('show');
        this.startNewGame();
    }

    closeUnlockModal() {
        this.unlockModal.classList.remove('show');
    }

    updateDisplay() {
        this.scoreEl.textContent = this.score;
        this.movesEl.textContent = this.moves;
        this.matchedEl.textContent = this.matchedPairs;
        this.totalEl.textContent = this.totalPairs;
        this.hintCountEl.textContent = this.hints;

        this.hintBtn.disabled = this.hints <= 0;
    }

    updateCollectionDisplay() {
        this.puzzleCountEl.textContent = `${this.progress.puzzlePieces.length}/12`;
        this.highScoreEl.textContent = this.progress.highScore;
        this.totalStarsEl.textContent = this.progress.totalStars;
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
                flip: { freq: 400, duration: 0.1, type: 'sine' },
                match: { freq: 600, duration: 0.2, type: 'sine' },
                wrong: { freq: 200, duration: 0.15, type: 'square' },
                combo: { freq: 800, duration: 0.25, type: 'triangle' },
                win: { freq: 1000, duration: 0.3, type: 'sine' },
                hint: { freq: 500, duration: 0.15, type: 'triangle' },
                start: { freq: 450, duration: 0.15, type: 'sine' }
            };

            const sound = sounds[type] || sounds.flip;

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
        localStorage.setItem('memoryFlipProgress', JSON.stringify(this.progress));
    }

    loadProgress() {
        const saved = localStorage.getItem('memoryFlipProgress');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.progress = { ...this.progress, ...parsed };
            } catch (e) {
                // Invalid data, use defaults
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.game = new MemoryFlipGame();

    console.log('%c🎴 记忆翻翻乐已加载！', 'font-size: 20px; color: #4ECDC4;');
    console.log('%c帮小狐狸找回朋友们吧！', 'font-size: 14px; color: #FF6B6B;');
});
