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

        this.init();
    }

    init() {
        this.bindEvents();
        this.loadRandomImage();
    }

    bindEvents() {
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const size = parseInt(btn.dataset.size);
                this.startGame(size);
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

    loadRandomImage() {
        const canvas = document.getElementById('cutting-canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = 600;
        canvas.height = 600;

        const gradient = ctx.createLinearGradient(0, 0, 600, 600);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(0.5, '#764ba2');
        gradient.addColorStop(1, '#f093fb');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 600, 600);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * 600;
            const y = Math.random() * 600;
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

        document.getElementById('difficulty-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');

        this.updateDisplay();
        this.createPuzzle();
        this.shufflePuzzle();
        this.renderPuzzle();
    }

    createPuzzle() {
        this.pieces = [];
        const totalPieces = this.gridSize * this.gridSize;
        const pieceSize = 600 / this.gridSize;

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

        const containerWidth = Math.min(window.innerWidth - 40, 600);
        const pieceSize = Math.floor(containerWidth / this.gridSize);

        grid.style.gridTemplateColumns = `repeat(${this.gridSize}, ${pieceSize}px)`;
        grid.style.gridTemplateRows = `repeat(${this.gridSize}, ${pieceSize}px)`;

        this.pieces.forEach((piece, index) => {
            const pieceElement = document.createElement('div');
            pieceElement.className = 'puzzle-piece';
            pieceElement.style.width = `${pieceSize}px`;
            pieceElement.style.height = `${pieceSize}px`;
            pieceElement.style.backgroundImage = `url(${this.currentImage})`;
            pieceElement.style.backgroundSize = `${600}px ${600}px`;
            pieceElement.style.backgroundPosition = piece.backgroundPosition;
            pieceElement.dataset.id = piece.id;
            pieceElement.dataset.index = index;
            pieceElement.draggable = true;

            this.addDragEvents(pieceElement);

            grid.appendChild(pieceElement);
        });
    }

    addDragEvents(pieceElement) {
        pieceElement.addEventListener('dragstart', (e) => {
            if (!this.gameStarted) {
                this.startTimer();
                this.gameStarted = true;
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
            if (this.draggedPiece && this.draggedPiece !== pieceElement) {
                pieceElement.classList.add('drag-over');
            }
        });

        pieceElement.addEventListener('dragleave', (e) => {
            pieceElement.classList.remove('drag-over');
        });

        pieceElement.addEventListener('drop', (e) => {
            e.preventDefault();
            pieceElement.classList.remove('drag-over');

            if (this.draggedPiece && this.draggedPiece !== pieceElement) {
                const fromIndex = parseInt(this.draggedPiece.dataset.index);
                const toIndex = parseInt(pieceElement.dataset.index);

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
            e.preventDefault();
        }, { passive: false });

        pieceElement.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });

        pieceElement.addEventListener('touchend', (e) => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            const element = document.elementFromPoint(touch.clientX, touch.clientY);

            if (element && element.classList.contains('puzzle-piece') && element !== pieceElement) {
                const fromIndex = parseInt(pieceElement.dataset.index);
                const toIndex = parseInt(element.dataset.index);

                this.swapPieces(fromIndex, toIndex);
                this.moves++;
                this.updateDisplay();
                this.renderPuzzle();
                this.checkComplete();
            }
        }, { passive: false });
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
            this.showCompleteModal();
        }
    }

    showCompleteModal() {
        const minutes = Math.floor(this.seconds / 60);
        const seconds = this.seconds % 60;
        const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        document.getElementById('complete-time').textContent = timeStr;
        document.getElementById('complete-moves').textContent = this.moves;

        const stars = this.calculateStars();
        document.getElementById('complete-stars').textContent = stars;

        document.getElementById('complete-modal').classList.remove('hidden');
    }

    hideCompleteModal() {
        document.getElementById('complete-modal').classList.add('hidden');
    }

    calculateStars() {
        const totalPieces = this.gridSize * this.gridSize;
        const optimalMoves = totalPieces * 2;
        const timeLimit = totalPieces * 3;

        let stars = '⭐';

        if (this.moves <= optimalMoves * 1.5 && this.seconds <= timeLimit * 1.5) {
            stars = '⭐⭐⭐';
        } else if (this.moves <= optimalMoves * 2 && this.seconds <= timeLimit * 2) {
            stars = '⭐⭐';
        }

        return stars;
    }

    showPreview() {
        const previewImage = document.getElementById('preview-image');
        previewImage.src = this.currentImage;
        document.getElementById('preview-modal').classList.remove('hidden');
    }

    hidePreview() {
        document.getElementById('preview-modal').classList.add('hidden');
    }

    resetGame() {
        this.stopTimer();
        this.startGame(this.gridSize);
    }

    backToMenu() {
        this.stopTimer();
        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('complete-modal').classList.add('hidden');
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
