/* 数字消消乐 - 游戏逻辑 */

class NumberMatchGame {
    constructor() {
        this.targetNumber = 10;
        this.gridSize = 5;
        this.grid = [];
        this.selectedCells = [];
        this.score = 0;
        this.moves = 0;
        this.combo = 0;
        this.hints = 3;
        this.shuffles = 2;
        
        this.initElements();
        this.bindEvents();
        this.loadProgress();
        this.startNewGame();
    }

    initElements() {
        this.boardEl = document.getElementById('game-board');
        this.scoreEl = document.getElementById('score');
        this.targetEl = document.getElementById('target');
        this.movesEl = document.getElementById('moves');
        this.sumExpressionEl = document.getElementById('sum-expression');
        this.comboDisplayEl = document.getElementById('combo-display');
        this.confirmBtn = document.getElementById('confirm-btn');
        this.clearBtn = document.getElementById('clear-btn');
        this.hintBtn = document.getElementById('hint-btn');
        this.hintCountEl = document.getElementById('hint-count');
        this.shuffleBtn = document.getElementById('shuffle-btn');
        this.shuffleCountEl = document.getElementById('shuffle-count');
        this.diffBtns = document.querySelectorAll('.diff-btn');
        this.modal = document.getElementById('result-modal');
        this.modalEmoji = document.getElementById('modal-emoji');
        this.modalTitle = document.getElementById('modal-title');
        this.modalMessage = document.getElementById('modal-message');
        this.modalScore = document.getElementById('modal-score');
        this.modalBtn = document.getElementById('modal-btn');
        this.celebrationEl = document.getElementById('celebration');
    }

    bindEvents() {
        this.confirmBtn.addEventListener('click', () => this.confirmSelection());
        this.clearBtn.addEventListener('click', () => this.clearSelection());
        this.hintBtn.addEventListener('click', () => this.showHint());
        this.shuffleBtn.addEventListener('click', () => this.shuffleBoard());
        this.modalBtn.addEventListener('click', () => this.closeModal());
        
        this.diffBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.diffBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.targetNumber = parseInt(btn.dataset.target);
                this.gridSize = parseInt(btn.dataset.size);
                this.startNewGame();
            });
        });
    }

    startNewGame() {
        this.grid = [];
        this.selectedCells = [];
        this.moves = 0;
        this.combo = 0;
        
        this.targetEl.textContent = this.targetNumber;
        this.updateDisplay();
        this.generateGrid();
        this.renderBoard();
    }

    generateGrid() {
        this.grid = [];
        for (let row = 0; row < this.gridSize; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.gridSize; col++) {
                this.grid[row][col] = this.getRandomNumber();
            }
        }
    }

    getRandomNumber() {
        const max = Math.min(this.targetNumber - 1, 9);
        return Math.floor(Math.random() * max) + 1;
    }

    renderBoard() {
        this.boardEl.innerHTML = '';
        this.boardEl.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const cell = this.createCell(row, col, this.grid[row][col]);
                this.boardEl.appendChild(cell);
            }
        }
    }

    createCell(row, col, value) {
        const cell = document.createElement('div');
        cell.className = 'number-cell';
        cell.dataset.row = row;
        cell.dataset.col = col;
        cell.dataset.value = value;
        cell.textContent = value;
        
        cell.addEventListener('click', () => this.handleCellClick(row, col));
        cell.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleCellClick(row, col);
        }, { passive: false });
        
        return cell;
    }

    handleCellClick(row, col) {
        const cellIndex = this.selectedCells.findIndex(
            c => c.row === row && c.col === col
        );
        
        if (cellIndex !== -1) {
            this.selectedCells.splice(cellIndex);
            this.updateSelection();
        } else {
            if (this.selectedCells.length === 0 || this.isAdjacent(row, col)) {
                this.selectedCells.push({ row, col, value: this.grid[row][col] });
                this.updateSelection();
            }
        }
        
        this.playSound('select');
    }

    isAdjacent(row, col) {
        const last = this.selectedCells[this.selectedCells.length - 1];
        const rowDiff = Math.abs(last.row - row);
        const colDiff = Math.abs(last.col - col);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    updateSelection() {
        document.querySelectorAll('.number-cell').forEach(cell => {
            cell.classList.remove('selected');
            const orderBadge = cell.querySelector('.select-order');
            if (orderBadge) orderBadge.remove();
        });
        
        this.selectedCells.forEach((cell, index) => {
            const cellEl = this.boardEl.querySelector(
                `[data-row="${cell.row}"][data-col="${cell.col}"]`
            );
            if (cellEl) {
                cellEl.classList.add('selected');
                const orderBadge = document.createElement('span');
                orderBadge.className = 'select-order';
                orderBadge.textContent = index + 1;
                cellEl.appendChild(orderBadge);
            }
        });
        
        this.updateSumDisplay();
        this.updateButtons();
    }

    updateSumDisplay() {
        if (this.selectedCells.length === 0) {
            this.sumExpressionEl.textContent = '点击数字开始';
            this.sumExpressionEl.classList.remove('success');
            return;
        }
        
        const values = this.selectedCells.map(c => c.value);
        const sum = values.reduce((a, b) => a + b, 0);
        const expression = values.join(' + ') + ' = ' + sum;
        
        this.sumExpressionEl.textContent = expression;
        
        if (sum === this.targetNumber) {
            this.sumExpressionEl.classList.add('success');
            this.playSound('match');
        } else {
            this.sumExpressionEl.classList.remove('success');
        }
    }

    updateButtons() {
        const sum = this.getSelectedSum();
        const canConfirm = this.selectedCells.length > 0 && sum === this.targetNumber;
        
        this.confirmBtn.disabled = !canConfirm;
        this.clearBtn.disabled = this.selectedCells.length === 0;
    }

    getSelectedSum() {
        return this.selectedCells.reduce((sum, cell) => sum + cell.value, 0);
    }

    confirmSelection() {
        const sum = this.getSelectedSum();
        if (sum !== this.targetNumber) return;
        
        this.moves++;
        this.combo++;
        
        const baseScore = this.selectedCells.length * 10;
        const comboBonus = this.combo > 1 ? this.combo * 5 : 0;
        const earnedScore = baseScore + comboBonus;
        
        this.score += earnedScore;
        
        this.animateRemoval(() => {
            this.removeSelectedCells();
            this.fillEmptySpaces();
            this.updateDisplay();
            this.showResult(earnedScore);
            this.saveProgress();
        });
        
        this.playSound('success');
        this.celebrate();
    }

    animateRemoval(callback) {
        this.selectedCells.forEach(cell => {
            const cellEl = this.boardEl.querySelector(
                `[data-row="${cell.row}"][data-col="${cell.col}"]`
            );
            if (cellEl) {
                cellEl.classList.add('removing');
            }
        });
        
        setTimeout(callback, 400);
    }

    removeSelectedCells() {
        this.selectedCells.forEach(cell => {
            this.grid[cell.row][cell.col] = null;
        });
        this.selectedCells = [];
    }

    fillEmptySpaces() {
        for (let col = 0; col < this.gridSize; col++) {
            const column = [];
            for (let row = 0; row < this.gridSize; row++) {
                if (this.grid[row][col] !== null) {
                    column.push(this.grid[row][col]);
                }
            }
            
            while (column.length < this.gridSize) {
                column.unshift(this.getRandomNumber());
            }
            
            for (let row = 0; row < this.gridSize; row++) {
                this.grid[row][col] = column[row];
            }
        }
        
        this.renderBoard();
        this.animateNewCells();
    }

    animateNewCells() {
        const cells = this.boardEl.querySelectorAll('.number-cell');
        cells.forEach((cell, index) => {
            setTimeout(() => {
                cell.classList.add('spawning');
            }, index * 30);
        });
    }

    clearSelection() {
        this.selectedCells = [];
        this.updateSelection();
        this.playSound('clear');
    }

    updateDisplay() {
        this.scoreEl.textContent = this.score;
        this.movesEl.textContent = this.moves;
        this.hintCountEl.textContent = this.hints;
        this.shuffleCountEl.textContent = this.shuffles;
        
        this.hintBtn.disabled = this.hints <= 0;
        this.shuffleBtn.disabled = this.shuffles <= 0;
        
        this.updateComboDisplay();
    }

    updateComboDisplay() {
        const comboValue = this.comboDisplayEl.querySelector('.combo-value');
        if (this.combo > 1) {
            this.comboDisplayEl.classList.add('active');
            comboValue.textContent = `x${this.combo}`;
        } else {
            this.comboDisplayEl.classList.remove('active');
            comboValue.textContent = 'x1';
        }
    }

    showHint() {
        if (this.hints <= 0) return;
        
        const hint = this.findValidCombination();
        if (hint) {
            this.hints--;
            this.updateDisplay();
            
            hint.forEach(cell => {
                const cellEl = this.boardEl.querySelector(
                    `[data-row="${cell.row}"][data-col="${cell.col}"]`
                );
                if (cellEl) {
                    cellEl.classList.add('hint');
                    setTimeout(() => cellEl.classList.remove('hint'), 2000);
                }
            });
            
            this.playSound('hint');
        } else {
            this.showMessage('😅', '没有提示了', '试试重新排列吧！');
        }
    }

    findValidCombination() {
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const result = this.dfs(row, col, [], 0);
                if (result) return result;
            }
        }
        return null;
    }

    dfs(row, col, path, sum) {
        if (sum === this.targetNumber && path.length > 0) {
            return path;
        }
        if (sum > this.targetNumber) {
            return null;
        }
        
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        
        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;
            
            if (newRow >= 0 && newRow < this.gridSize && 
                newCol >= 0 && newCol < this.gridSize) {
                
                const key = `${newRow},${newCol}`;
                if (path.some(p => p.row === newRow && p.col === newCol)) continue;
                
                const value = this.grid[newRow][newCol];
                const newPath = [...path, { row: newRow, col: newCol, value }];
                const result = this.dfs(newRow, newCol, newPath, sum + value);
                if (result) return result;
            }
        }
        
        return null;
    }

    shuffleBoard() {
        if (this.shuffles <= 0) return;
        
        this.shuffles--;
        this.combo = 0;
        this.updateDisplay();
        
        const allNumbers = [];
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                allNumbers.push(this.grid[row][col]);
            }
        }
        
        for (let i = allNumbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allNumbers[i], allNumbers[j]] = [allNumbers[j], allNumbers[i]];
        }
        
        let index = 0;
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                this.grid[row][col] = allNumbers[index++];
            }
        }
        
        this.selectedCells = [];
        this.renderBoard();
        this.animateNewCells();
        this.playSound('shuffle');
    }

    showResult(earnedScore) {
        const messages = [
            { emoji: '🎉', title: '太棒了！', msg: '你真聪明！' },
            { emoji: '⭐', title: '厉害！', msg: '继续保持！' },
            { emoji: '🌟', title: '真厉害！', msg: '你做得很好！' },
            { emoji: '👏', title: '好极了！', msg: '再接再厉！' },
            { emoji: '🏆', title: '完美！', msg: '你是数学小天才！' }
        ];
        
        const comboMessages = [
            { emoji: '🔥', title: '连击！', msg: `${this.combo}连击！继续加油！` },
            { emoji: '💥', title: '超级连击！', msg: `${this.combo}连击！太厉害了！` },
            { emoji: '🌈', title: '疯狂连击！', msg: `${this.combo}连击！无人能挡！` }
        ];
        
        let message;
        if (this.combo >= 3) {
            message = comboMessages[Math.min(this.combo - 3, comboMessages.length - 1)];
        } else {
            message = messages[Math.floor(Math.random() * messages.length)];
        }
        
        this.modalEmoji.textContent = message.emoji;
        this.modalTitle.textContent = message.title;
        this.modalMessage.textContent = message.msg;
        this.modalScore.textContent = `+${earnedScore}`;
        this.modal.classList.add('show');
    }

    showMessage(emoji, title, message) {
        this.modalEmoji.textContent = emoji;
        this.modalTitle.textContent = title;
        this.modalMessage.textContent = message;
        this.modalScore.textContent = '';
        this.modal.classList.add('show');
    }

    closeModal() {
        this.modal.classList.remove('show');
        this.updateSelection();
    }

    celebrate() {
        if (this.combo >= 2) {
            this.createConfetti();
        }
    }

    createConfetti() {
        const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1A3', '#A06CD5', '#74B9FF'];
        
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDelay = Math.random() * 0.5 + 's';
                this.celebrationEl.appendChild(confetti);
                
                setTimeout(() => confetti.remove(), 3000);
            }, i * 50);
        }
    }

    playSound(type) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        const sounds = {
            select: { freq: 400, duration: 0.1, type: 'sine' },
            match: { freq: 600, duration: 0.15, type: 'sine' },
            success: { freq: 800, duration: 0.2, type: 'sine' },
            clear: { freq: 300, duration: 0.1, type: 'sine' },
            hint: { freq: 500, duration: 0.15, type: 'triangle' },
            shuffle: { freq: 350, duration: 0.2, type: 'square' }
        };
        
        const sound = sounds[type] || sounds.select;
        
        oscillator.type = sound.type;
        oscillator.frequency.setValueAtTime(sound.freq, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + sound.duration);
    }

    saveProgress() {
        const progress = {
            highScore: Math.max(this.score, this.getHighScore()),
            totalMoves: (this.getTotalMoves() || 0) + this.moves
        };
        localStorage.setItem('numberMatchProgress', JSON.stringify(progress));
    }

    loadProgress() {
        const progress = JSON.parse(localStorage.getItem('numberMatchProgress') || '{}');
        this.hints = 3;
        this.shuffles = 2;
    }

    getHighScore() {
        const progress = JSON.parse(localStorage.getItem('numberMatchProgress') || '{}');
        return progress.highScore || 0;
    }

    getTotalMoves() {
        const progress = JSON.parse(localStorage.getItem('numberMatchProgress') || '{}');
        return progress.totalMoves || 0;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.game = new NumberMatchGame();
    
    console.log('%c🔢 数字消消乐已加载！', 'font-size: 20px; color: #4ECDC4;');
    console.log('%c祝小朋友玩得开心！', 'font-size: 14px; color: #FF6B6B;');
});
