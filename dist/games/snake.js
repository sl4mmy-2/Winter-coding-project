// Ok, try replacing your existing snake.js with this:

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
        this.gameOver = false;
        this.speed = 100; // ms per move
        this.lastMoveTime = 0;
        
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
        this.gameOver = false;
        this.lastMoveTime = performance.now();
    }
    
    update(time) {
        if (this.gameOver) return;
        
        if (time - this.lastMoveTime < this.speed) return;
        this.lastMoveTime = time;
        
        // Update direction
        this.direction = this.nextDirection;
        
        // Calculate new head position
        const head = {
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };
        
        // Check wall collision
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver = true;
            return;
        }
        
        // Check self collision
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver = true;
            return;
        }
        
        // Add new head
        this.snake.unshift(head);
        
        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.food = this.spawnFood();
            // Speed up slightly
            this.speed = Math.max(50, this.speed - 1);
        } else {
            // Remove tail if no food eaten
            this.snake.pop();
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
                // Head - brighter gold
                this.ctx.fillStyle = '#f0c959';
            } else {
                // Body - darker gold
                this.ctx.fillStyle = '#d4af37';
            }
            this.ctx.fillRect(
                segment.x * this.tileSize + 1,
                segment.y * this.tileSize + 1,
                this.tileSize - 2,
                this.tileSize - 2
            );
        });
        
        // Draw food
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
        
        // Draw score
        this.ctx.fillStyle = '#d4af37';
        this.ctx.font = '24px system-ui';
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);
        this.ctx.fillText(`Length: ${this.snake.length}`, 10, 60);
        
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
