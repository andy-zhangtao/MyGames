class PuzzleGame {
    constructor() {
        this.gridSize = 3;
        this.pieces = [];
        this.currentImage = null;
        this.moves = 0;
        this.timer = null;
        this.seconds = 0;
        this.isDragging = false;
        this.draggedPiece = null;
        this.gameStarted = false;
        this.isComplete = false;
        this.moveHistory = [];
        this.powerups = {
            hint: 3,
            autoOne: 2,
            autoMultiple: 2,
            peek: 3,
            undo: 3
        };
        this.totalStars = this.loadTotalStars();
        this.earnedStars = 0;
        this.isPeeking = false;

        this.init();
    }

    init() {
        this.bindEvents();
        this.loadRandomImage();
        this.updateStarsDisplay();
    }

    bindEvents() {
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const size = parseInt(btn.dataset.size);
                this.startGame(size);
            });
        });

        document.getElementById('shop-btn').addEventListener('click', () => this.showShop());
        document.getElementById('shop-close').addEventListener('click', () => this.hideShop());
        document.getElementById('shop-modal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('shop-modal')) {
                this.hideShop();
            }
        });

        document.querySelectorAll('.powerup-item').forEach(item => {
            item.addEventListener('click', () => {
                const type = item.dataset.powerup;
                this.usePowerup(type);
            });
        });

        document.querySelectorAll('.shop-buy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const price = parseInt(btn.dataset.price);
                const shopItem = btn.closest('.shop-item');
                const powerupType = shopItem.dataset.powerup;
                this.buyPowerup(powerupType, price);
            });
        });

        document.getElementById('preview-btn').addEventListener('click', () => this.showPreview());
        document.getElementById('preview-close').addEventListener('click', () => this.hidePreview());
        document.getElementById('preview-modal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('preview-modal')) {
                this.hidePreview();
            }
        });

        document.getElementById('reset-btn').addEventListener('click', () => this.resetGame());
        document.getElementById('back-to-menu-btn').addEventListener('click', () => this.backToMenu());
        document.getElementById('complete-close').addEventListener('click', () => this.hideCompleteModal());
        document.getElementById('play-again-btn').addEventListener('click', () => this.playAgain());
        document.getElementById('change-difficulty-btn').addEventListener('click', () => this.backToMenu());
    }

    loadTotalStars() {
        const stored = localStorage.getItem('puzzleTotalStars');
        return stored ? parseInt(stored) : 0;
    }

    saveTotalStars() {
        localStorage.setItem('puzzleTotalStars', this.totalStars.toString());
    }

    updateStarsDisplay() {
        document.getElementById('total-stars').textContent = this.totalStars;
        document.getElementById('shop-stars-count').textContent = this.totalStars;
    }

    async loadRandomImage() {
        const imageList = ['1.png', '2.png', '3.png', '4.png', '5.png'];

        const availableImages = [];
        const loadPromises = [];

        for (const filename of imageList) {
            const promise = this.checkImageExists(`./images/${filename}`);
            loadPromises.push(promise);
        }

        const results = await Promise.allSettled(loadPromises);

        results.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value) {
                availableImages.push(imageList[index]);
            }
        });

        console.log('Available images:', availableImages);

        if (availableImages.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableImages.length);
            const randomImage = availableImages[randomIndex];

            console.log('Selected image:', randomImage);

            const img = new Image();

            return new Promise((resolve) => {
                img.onload = () => {
                    const canvas = document.getElementById('cutting-canvas');
                    const ctx = canvas.getContext('2d');

                    const maxSize = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > maxSize || height > maxSize) {
                        const ratio = Math.min(maxSize / width, maxSize / height);
                        width = width * ratio;
                        height = height * ratio;
                    }

                    canvas.width = 800;
                    canvas.height = 800;

                    ctx.fillStyle = '#f0f0f0';
                    ctx.fillRect(0, 0, 800, 800);

                    const x = (800 - width) / 2;
                    const y = (800 - height) / 2;

                    ctx.drawImage(img, x, y, width, height);

                    this.currentImage = canvas.toDataURL('image/png', 0.9);
                    console.log('Image loaded successfully');
                    resolve();
                };

                img.onerror = (e) => {
                    console.error('Failed to load image:', randomImage, e);
                    this.generateFallbackImage();
                    resolve();
                };

                const imagePath = new URL(randomImage, window.location.href).href;
                img.src = imagePath;
            });
        } else {
            console.log('No images found, using fallback');
            this.generateFallbackImage();
        }
    }

    async checkImageExists(imagePath) {
        try {
            const response = await fetch(imagePath, { method: 'HEAD' });
            return response.ok;
        } catch {
            return false;
        }
    }

    generateFallbackImage() {
        const canvas = document.getElementById('cutting-canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = 800;
        canvas.height = 800;

        const gradient = ctx.createLinearGradient(0, 0, 800, 800);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(0.5, '#764ba2');
        gradient.addColorStop(1, '#f093fb');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 800, 800);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * 800;
            const y = Math.random() * 800;
            const radius = Math.random() * 50 + 20;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        this.currentImage = canvas.toDataURL();
    }

    startGame(size) {
        this.gridSize = size;
        this.moves = 0;
        this.seconds = 0;
        this.gameStarted = false;
        this.isComplete = false;
        this.moveHistory = [];
        this.earnedStars = 0;
        this.isPeeking = false;

        document.getElementById('difficulty-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');

        this.updateDisplay();
        this.updatePowerupDisplay();
        this.createPuzzle();
        this.shufflePuzzle();
        this.renderPuzzle();
    }

    createPuzzle() {
        this.pieces = [];
        const totalPieces = this.gridSize * this.gridSize;
        const pieceSize = 800 / this.gridSize;

        for (let i = 0; i < totalPieces; i++) {
            const row = Math.floor(i / this.gridSize);
            const col = i % this.gridSize;

            this.pieces.push({
                id: i,
                currentPosition: i,
                correctPosition: i,
                backgroundPosition: `-${col * pieceSize}px -${row * pieceSize}px`
            });
        }
    }

    shufflePuzzle() {
        const totalPieces = this.gridSize * this.gridSize;
        const shuffleMoves = totalPieces * 10;

        for (let i = 0; i < shuffleMoves; i++) {
            const pos1 = Math.floor(Math.random() * totalPieces);
            const pos2 = Math.floor(Math.random() * totalPieces);

            this.swapPieces(pos1, pos2);
        }

        this.moveHistory = [];
    }

    swapPieces(pos1, pos2) {
        const temp = this.pieces[pos1];
        this.pieces[pos1] = this.pieces[pos2];
        this.pieces[pos2] = temp;

        this.pieces[pos1].currentPosition = pos1;
        this.pieces[pos2].currentPosition = pos2;
    }

    renderPuzzle() {
        const grid = document.getElementById('puzzle-grid');
        grid.innerHTML = '';

        const containerWidth = Math.min(window.innerWidth - 40, 800);
        const pieceSize = Math.floor(containerWidth / this.gridSize);

        grid.style.gridTemplateColumns = `repeat(${this.gridSize}, ${pieceSize}px)`;
        grid.style.gridTemplateRows = `repeat(${this.gridSize}, ${pieceSize}px)`;

        this.pieces.forEach((piece, index) => {
            const pieceElement = document.createElement('div');
            pieceElement.className = 'puzzle-piece';
            pieceElement.style.width = `${pieceSize}px`;
            pieceElement.style.height = `${pieceSize}px`;
            pieceElement.style.backgroundImage = `url(${this.currentImage})`;
            pieceElement.style.backgroundSize = `${800}px ${800}px`;
            pieceElement.style.backgroundPosition = piece.backgroundPosition;
            pieceElement.dataset.id = piece.id;
            pieceElement.dataset.index = index;
            pieceElement.draggable = true;

            this.addDragEvents(pieceElement);

            grid.appendChild(pieceElement);
        });

        this.clearHighlights();
    }

    addDragEvents(pieceElement) {
        pieceElement.addEventListener('dragstart', (e) => {
            if (!this.gameStarted) {
                this.startTimer();
                this.gameStarted = true;
            }
            if (this.isPeeking) {
                e.preventDefault();
                return;
            }
            this.isDragging = true;
            this.draggedPiece = pieceElement;
            pieceElement.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        pieceElement.addEventListener('dragend', (e) => {
            this.isDragging = false;
            pieceElement.classList.remove('dragging');
            document.querySelectorAll('.puzzle-piece').forEach(p => {
                p.classList.remove('drag-over');
            });
            this.draggedPiece = null;
        });

        pieceElement.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (this.draggedPiece && this.draggedPiece !== pieceElement && !this.isPeeking) {
                pieceElement.classList.add('drag-over');
            }
        });

        pieceElement.addEventListener('dragleave', (e) => {
            pieceElement.classList.remove('drag-over');
        });

        pieceElement.addEventListener('drop', (e) => {
            e.preventDefault();
            pieceElement.classList.remove('drag-over');

            if (this.draggedPiece && this.draggedPiece !== pieceElement && !this.isPeeking) {
                const fromIndex = parseInt(this.draggedPiece.dataset.index);
                const toIndex = parseInt(pieceElement.dataset.index);

                this.recordMove(fromIndex, toIndex);
                this.swapPieces(fromIndex, toIndex);
                this.moves++;
                this.updateDisplay();
                this.renderPuzzle();
                this.checkComplete();
            }
        });

        pieceElement.addEventListener('touchstart', (e) => {
            if (!this.gameStarted) {
                this.startTimer();
                this.gameStarted = true;
            }
            if (this.isPeeking) {
                e.preventDefault();
                return;
            }
            e.preventDefault();
        }, { passive: false });

        pieceElement.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });

        pieceElement.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (this.isPeeking) return;

            const touch = e.changedTouches[0];
            const element = document.elementFromPoint(touch.clientX, touch.clientY);

            if (element && element.classList.contains('puzzle-piece') && element !== pieceElement) {
                const fromIndex = parseInt(pieceElement.dataset.index);
                const toIndex = parseInt(element.dataset.index);

                this.recordMove(fromIndex, toIndex);
                this.swapPieces(fromIndex, toIndex);
                this.moves++;
                this.updateDisplay();
                this.renderPuzzle();
                this.checkComplete();
            }
        }, { passive: false });
    }

    recordMove(fromIndex, toIndex) {
        this.moveHistory.push({
            from: fromIndex,
            to: toIndex,
            pieces: JSON.parse(JSON.stringify(this.pieces))
        });

        if (this.moveHistory.length > 50) {
            this.moveHistory.shift();
        }
    }

    startTimer() {
        if (this.timer) {
            clearInterval(this.timer);
        }

        this.timer = setInterval(() => {
            this.seconds++;
            this.updateDisplay();
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    updateDisplay() {
        const minutes = Math.floor(this.seconds / 60);
        const seconds = this.seconds % 60;
        document.getElementById('timer').textContent =
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('moves').textContent = this.moves;
    }

    checkComplete() {
        const isComplete = this.pieces.every((piece, index) => piece.id === index);

        if (isComplete && !this.isComplete) {
            this.isComplete = true;
            this.stopTimer();
            this.earnedStars = this.calculateStars();
            this.totalStars += this.earnedStars;
            this.saveTotalStars();
            this.updateStarsDisplay();
            this.showCompleteModal();
        }
    }

    calculateStars() {
        const totalPieces = this.gridSize * this.gridSize;
        const optimalMoves = totalPieces * 2;
        const timeLimit = totalPieces * 3;

        let stars = 1;

        if (this.moves <= optimalMoves * 1.5 && this.seconds <= timeLimit * 1.5) {
            stars = 3;
        } else if (this.moves <= optimalMoves * 2 && this.seconds <= timeLimit * 2) {
            stars = 2;
        }

        return stars;
    }

    showCompleteModal() {
        const minutes = Math.floor(this.seconds / 60);
        const seconds = this.seconds % 60;
        const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        document.getElementById('complete-time').textContent = timeStr;
        document.getElementById('complete-moves').textContent = this.moves;
        document.getElementById('complete-stars').textContent = '⭐'.repeat(this.earnedStars);
        document.getElementById('earned-stars').textContent = `+${this.earnedStars} ⭐`;

        document.getElementById('complete-modal').classList.remove('hidden');
    }

    hideCompleteModal() {
        document.getElementById('complete-modal').classList.add('hidden');
    }

    updatePowerupDisplay() {
        document.getElementById('hint-count').textContent = this.powerups.hint;
        document.getElementById('auto-one-count').textContent = this.powerups.autoOne;
        document.getElementById('auto-multiple-count').textContent = this.powerups.autoMultiple;
        document.getElementById('peek-count').textContent = this.powerups.peek;
        document.getElementById('undo-count').textContent = this.powerups.undo;

        document.querySelectorAll('.powerup-item').forEach(item => {
            const type = item.dataset.powerup;
            const count = this.powerups[type];

            if (count <= 0) {
                item.classList.add('disabled');
            } else {
                item.classList.remove('disabled');
            }
        });

        this.updateShopButtons();
    }

    updateShopButtons() {
        document.querySelectorAll('.shop-buy-btn').forEach(btn => {
            const price = parseInt(btn.dataset.price);
            btn.disabled = this.totalStars < price;
        });
    }

    usePowerup(type) {
        if (this.powerups[type] <= 0 || this.isComplete) return;

        switch (type) {
            case 'hint':
                this.useHintPowerup();
                break;
            case 'autoOne':
                this.useAutoOnePowerup();
                break;
            case 'autoMultiple':
                this.useAutoMultiplePowerup();
                break;
            case 'peek':
                this.usePeekPowerup();
                break;
            case 'undo':
                this.useUndoPowerup();
                break;
        }
    }

    useHintPowerup() {
        this.powerups.hint--;
        this.updatePowerupDisplay();

        const wrongPieces = this.pieces.filter((piece, index) => piece.id !== index);

        if (wrongPieces.length > 0) {
            const randomPiece = wrongPieces[Math.floor(Math.random() * wrongPieces.length)];
            const correctPosition = randomPiece.correctPosition;

            const pieces = document.querySelectorAll('.puzzle-piece');
            const targetPiece = pieces[correctPosition];

            if (targetPiece) {
                targetPiece.style.border = '4px solid #feca57';
                targetPiece.style.boxShadow = '0 0 20px rgba(254, 202, 87, 0.8)';

                setTimeout(() => {
                    this.renderPuzzle();
                }, 2000);
            }
        }
    }

    useAutoOnePowerup() {
        this.powerups.autoOne--;
        this.updatePowerupDisplay();

        const wrongPieces = this.pieces
            .map((piece, index) => ({ piece, index }))
            .filter(item => item.piece.id !== item.index);

        if (wrongPieces.length > 0) {
            const randomWrong = wrongPieces[Math.floor(Math.random() * wrongPieces.length)];
            const wrongIndex = randomWrong.index;
            const correctIndex = randomWrong.piece.correctPosition;

            const pieceAtCorrect = this.pieces.find((p, i) => i === correctIndex);
            const pieceAtWrong = this.pieces.find((p, i) => i === wrongIndex);

            if (pieceAtCorrect && pieceAtWrong) {
                this.recordMove(wrongIndex, correctIndex);
                this.swapPieces(wrongIndex, correctIndex);
                this.moves++;
                this.updateDisplay();
                this.renderPuzzle();
                this.checkComplete();
            }
        }
    }

    useAutoMultiplePowerup() {
        this.powerups.autoMultiple--;
        this.updatePowerupDisplay();

        const wrongPieces = this.pieces
            .map((piece, index) => ({ piece, index }))
            .filter(item => item.piece.id !== item.index);

        const numToFix = Math.min(3 + Math.floor(Math.random() * 3), wrongPieces.length);

        for (let i = 0; i < numToFix; i++) {
            if (wrongPieces.length === 0) break;

            const randomIndex = Math.floor(Math.random() * wrongPieces.length);
            const randomWrong = wrongPieces[randomIndex];
            const wrongIndex = randomWrong.index;
            const correctIndex = randomWrong.piece.correctPosition;

            const pieceAtCorrect = this.pieces.find((p, i) => i === correctIndex);
            const pieceAtWrong = this.pieces.find((p, i) => i === wrongIndex);

            if (pieceAtCorrect && pieceAtWrong) {
                this.recordMove(wrongIndex, correctIndex);
                this.swapPieces(wrongIndex, correctIndex);
                this.moves++;
            }

            wrongPieces.splice(randomIndex, 1);
        }

        this.updateDisplay();
        this.renderPuzzle();
        this.checkComplete();
    }

    usePeekPowerup() {
        if (this.isPeeking) return;

        this.powerups.peek--;
        this.updatePowerupDisplay();

        this.isPeeking = true;

        const previewModal = document.getElementById('preview-modal');
        const previewImage = document.getElementById('preview-image');
        previewImage.src = this.currentImage;
        previewModal.classList.remove('hidden');

        setTimeout(() => {
            previewModal.classList.add('hidden');
            this.isPeeking = false;
        }, 3000);
    }

    useUndoPowerup() {
        if (this.moveHistory.length === 0) {
            alert('没有可以撤销的步骤！');
            return;
        }

        this.powerups.undo--;
        this.updatePowerupDisplay();

        const lastMove = this.moveHistory.pop();

        if (lastMove) {
            this.pieces = lastMove.pieces;
            this.pieces.forEach((piece, index) => {
                piece.currentPosition = index;
            });
            this.moves--;
            this.updateDisplay();
            this.renderPuzzle();
        }
    }

    showPreview() {
        const previewImage = document.getElementById('preview-image');
        previewImage.src = this.currentImage;
        document.getElementById('preview-modal').classList.remove('hidden');
    }

    hidePreview() {
        document.getElementById('preview-modal').classList.add('hidden');
    }

    showShop() {
        this.updateShopButtons();
        document.getElementById('shop-modal').classList.remove('hidden');
    }

    hideShop() {
        document.getElementById('shop-modal').classList.add('hidden');
    }

    buyPowerup(type, price) {
        if (this.totalStars < price) {
            alert('星星不够！');
            return;
        }

        this.totalStars -= price;
        this.powerups[type]++;
        this.saveTotalStars();
        this.updateStarsDisplay();
        this.updateShopButtons();
        this.updatePowerupDisplay();
    }

    clearHighlights() {
        document.querySelectorAll('.puzzle-piece').forEach(piece => {
            piece.style.border = '';
            piece.style.boxShadow = '';
        });
    }

    resetGame() {
        this.stopTimer();
        this.startGame(this.gridSize);
    }

    backToMenu() {
        this.stopTimer();
        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('complete-modal').classList.add('hidden');
        document.getElementById('shop-modal').classList.add('hidden');
        document.getElementById('difficulty-screen').classList.remove('hidden');
    }

    playAgain() {
        this.hideCompleteModal();
        this.resetGame();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PuzzleGame();
});
