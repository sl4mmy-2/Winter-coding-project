// Falling blocks game
export class BlocksGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = 10;  // grid width
        this.height = 20; // grid height
        this.blockSize = Math.min(canvas.width / this.width, canvas.height / this.height);
        
        this.grid = Array(this.height).fill().map(() => Array(this.width).fill(0));
        this.currentPiece = null;
        this.currentX = 0;
        this.currentY = 0;
        this.score = 0;
        this.gameOver = false;
        this.dropCounter = 0;
        this.dropInterval = 1000; // ms
        this.lastTime = 0;
        
        this.colors = [
            '#000000', // 0 = empty
            '#00F0F0', // I - cyan
            '#F0F000', // O - yellow
            '#A000F0', // T - purple
            '#00F000', // S - green
            '#F00000', // Z - red
            '#0000F0', // J - blue
            '#F0A000'  // L - orange
        ];
        
        this.pieces = {
            'I': [[1,1,1,1]],
            'O': [[1,1],[1,1]],
            'T': [[0,1,0],[1,1,1]],
            'S': [[0,1,1],[1,1,0]],
            'Z': [[1,1,0],[0,1,1]],
            'J': [[1,0,0],[1,1,1]],
            'L': [[0,0,1],[1,1,1]]
        };
        
        this.pieceTypes = Object.keys(this.pieces);
        
        this.boundKeyDown = this.handleKeyDown.bind(this);
        document.addEventListener('keydown', this.boundKeyDown);
    }
    
    init() {
        this.spawnPiece();
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    spawnPiece() {
        const type = this.pieceTypes[Math.floor(Math.random() * this.pieceTypes.length)];
        this.currentPiece = {
            shape: this.pieces[type],
            color: this.pieceTypes.indexOf(type) + 1
        };
        this.currentX = Math.floor(this.width / 2) - Math.floor(this.currentPiece.shape[0].length / 2);
        this.currentY = 0;
        
        if (this.checkCollision(0, 0)) {
            this.gameOver = true;
        }
    }
    
    checkCollision(offsetX, offsetY, shape = this.currentPiece.shape) {
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const newX = this.currentX + x + offsetX;
                    const newY = this.currentY + y + offsetY;
                    
                    if (newX < 0 || newX >= this.width || newY >= this.height) {
                        return true;
                    }
                    if (newY >= 0 && this.grid[newY][newX]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    mergePiece() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    this.grid[this.currentY + y][this.currentX + x] = this.currentPiece.color;
                }
            }
        }
    }
    
    clearLines() {
        let linesCleared = 0;
        for (let y = this.height - 1; y >= 0; y--) {
            if (this.grid[y].every(cell => cell !== 0)) {
                this.grid.splice(y, 1);
                this.grid.unshift(Array(this.width).fill(0));
                linesCleared++;
                y++; // check same row again
            }
        }
        if (linesCleared > 0) {
            this.score += linesCleared * 100;
        }
    }
    
    rotate() {
        const rotated = this.currentPiece.shape[0].map((_, i) =>
            this.currentPiece.shape.map(row => row[i]).reverse()
        );
        
        if (!this.checkCollision(0, 0, rotated)) {
            this.currentPiece.shape = rotated;
        }
    }
    
    handleKeyDown(e) {
        if (this.gameOver) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                if (!this.checkCollision(-1, 0)) this.currentX--;
                break;
            case 'ArrowRight':
                if (!this.checkCollision(1, 0)) this.currentX++;
                break;
            case 'ArrowDown':
                if (!this.checkCollision(0, 1)) {
                    this.currentY++;
                    this.score += 1;
                }
                break;
            case 'ArrowUp':
            case ' ':
                this.rotate();
                break;
        }
        e.preventDefault();
    }
    
    update(deltaTime) {
        if (this.gameOver) return;
        
        this.dropCounter += deltaTime;
        if (this.dropCounter > this.dropInterval) {
            this.dropCounter = 0;
            
            if (!this.checkCollision(0, 1)) {
                this.currentY++;
            } else {
                this.mergePiece();
                this.clearLines();
                this.spawnPiece();
            }
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#1a3009';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.grid[y][x]) {
                    this.ctx.fillStyle = this.colors[this.grid[y][x]];
                    this.ctx.fillRect(
                        x * this.blockSize,
                        y * this.blockSize,
                        this.blockSize - 1,
                        this.blockSize - 1
                    );
                }
            }
        }
        
        // Draw current piece
        if (this.currentPiece) {
            this.ctx.fillStyle = this.colors[this.currentPiece.color];
            for (let y = 0; y < this.currentPiece.shape.length; y++) {
                for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                    if (this.currentPiece.shape[y][x]) {
                        this.ctx.fillRect(
                            (this.currentX + x) * this.blockSize,
                            (this.currentY + y) * this.blockSize,
                            this.blockSize - 1,
                            this.blockSize - 1
                        );
                    }
                }
            }
        }
        
        // Draw score
        this.ctx.fillStyle = '#d4af37';
        this.ctx.font = '24px system-ui';
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);
        
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, this.canvas.height / 2 - 40, this.canvas.width, 80);
            this.ctx.fillStyle = '#d4af37';
            this.ctx.font = '36px system-ui';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = '18px system-ui';
            this.ctx.fillText('Press R to restart', this.canvas.width / 2, this.canvas.height / 2 + 30);
            this.ctx.textAlign = 'left';
        }
    }
    
    gameLoop(time = 0) {
        const deltaTime = time - this.lastTime;
        this.lastTime = time;
        
        this.update(deltaTime);
        this.draw();
        
        this.animationId = requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    destroy() {
        document.removeEventListener('keydown', this.boundKeyDown);
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

export function init(canvas) {
    const game = new BlocksGame(canvas);
    game.init();
    return game;
}
