export class SnakeGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = 25;
        this.tileSize = Math.min(canvas.width, canvas.height) / this.tileCount;
        
        this.snake = [{x: 12, y: 12}];
        this.direction = {x: 1, y: 0};
        this.nextDirection = {x: 1, y: 0};
        this.food = this.spawnFood();
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('snakeHighScore') || '0');
        this.foodEaten = 0;
        this.gameOver = false;
        this.speed = 100; // ms per move
        this.lastMoveTime = 0;
        this.startTime = Date.now();
        
        this.boundKeyDown = this.handleKeyDown.bind(this);
        document.addEventListener('keydown', this.boundKeyDown);
    }
    
    init() {
        this.lastMoveTime = performance.now();
        this.gameLoop();
    }
    
    spawnFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y));
        return food;
    }
    
    handleKeyDown(e) {
        if (this.gameOver) {
            if (e.key === 'r' || e.key === 'R') {
                this.reset();
            }
            return;
        }
        
        switch(e.key) {
            case 'ArrowLeft':
                if (this.direction.x === 0) {
                    this.nextDirection = {x: -1, y: 0};
                }
                break;
            case 'ArrowRight':
                if (this.direction.x === 0) {
                    this.nextDirection = {x: 1, y: 0};
                }
                break;
            case 'ArrowUp':
                if (this.direction.y === 0) {
                    this.nextDirection = {x: 0, y: -1};
                }
                break;
            case 'ArrowDown':
                if (this.direction.y === 0) {
                    this.nextDirection = {x: 0, y: 1};
                }
                break;
        }
        e.preventDefault();
    }
    
    reset() {
        this.snake = [{x: 12, y: 12}];
        this.direction = {x: 1, y: 0};
        this.nextDirection = {x: 1, y: 0};
        this.food = this.spawnFood();
        this.score = 0;
        this.foodEaten = 0;
        this.gameOver = false;
        this.speed = 100;
        this.lastMoveTime = performance.now();
        this.startTime = Date.now();
    }
    
    getElapsedTime() {
        const seconds = Math.floor((Date.now() - this.startTime) / 1000);
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    update(time) {
        if (this.gameOver) return;
        
        if (time - this.lastMoveTime < this.speed) return;
        this.lastMoveTime = time;
        
        this.direction = this.nextDirection;
        
        const head = {
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };
        
        // Wall collision
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver = true;
            this.updateHighScore();
            return;
        }
        
        // Self collision
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver = true;
            this.updateHighScore();
            return;
        }
        
        this.snake.unshift(head);
        
        // Food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.foodEaten++;
            this.score += 10;
            this.food = this.spawnFood();
            this.speed = Math.max(50, this.speed - 1); // Speed up
        } else {
            this.snake.pop();
        }
    }
    
    updateHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.score.toString());
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#1a3009';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.ctx.strokeStyle = '#2d5016';
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.tileSize, 0);
            this.ctx.lineTo(i * this.tileSize, this.tileCount * this.tileSize);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.tileSize);
            this.ctx.lineTo(this.tileCount * this.tileSize, i * this.tileSize);
            this.ctx.stroke();
        }
        
        // Draw snake
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                this.ctx.fillStyle = '#f0c959'; // Head - bright gold
            } else {
                this.ctx.fillStyle = '#d4af37'; // Body - default gold
            }
            this.ctx.fillRect(
                segment.x * this.tileSize + 1,
                segment.y * this.tileSize + 1,
                this.tileSize - 2,
                this.tileSize - 2
            );
        });
        
        // Draw food (red circle)
        this.ctx.fillStyle = '#F00000';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.tileSize + this.tileSize / 2,
            this.food.y * this.tileSize + this.tileSize / 2,
            this.tileSize / 2 - 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        
        // Draw scoreboard panel
        this.drawScoreboard();
        
        // Game over screen
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
    
    drawScoreboard() {
        // Scoreboard background panel
        const panelWidth = 200;
        const panelHeight = 140;
        const padding = 10;
        
        this.ctx.fillStyle = 'rgba(26, 48, 9, 0.9)';
        this.ctx.fillRect(padding, padding, panelWidth, panelHeight);
        
        // Border
        this.ctx.strokeStyle = '#d4af37';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(padding, padding, panelWidth, panelHeight);
        
        // Text styling
        this.ctx.fillStyle = '#d4af37';
        this.ctx.font = 'bold 20px system-ui';
        this.ctx.textAlign = 'left';
        
        let y = padding + 30;
        const lineHeight = 28;
        
        // Score
        this.ctx.fillText(`Score: ${this.score}`, padding + 10, y);
        y += lineHeight;
        
        // High score
        this.ctx.fillStyle = this.score === this.highScore && this.score > 0 ? '#f0c959' : '#d4af37';
        this.ctx.fillText(`High: ${this.highScore}`, padding + 10, y);
        y += lineHeight;
        
        // Length
        this.ctx.fillStyle = '#d4af37';
        this.ctx.fillText(`Length: ${this.snake.length}`, padding + 10, y);
        y += lineHeight;
        
        // Time
        this.ctx.fillText(`Time: ${this.getElapsedTime()}`, padding + 10, y);
    }
    
    gameLoop(time = 0) {
        this.update(time);
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
    const game = new SnakeGame(canvas);
    game.init();
    return game;
}
