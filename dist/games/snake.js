// const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const TILE = 20;
const SIZE = 400;

let snake = [{x:200, y:200}];
let dir = {x:TILE, y:0};
let food = randomFood();

function randomFood(){
  return {
    x: Math.floor(Math.random()*(SIZE/TILE))*TILE,
    y: Math.floor(Math.random()*(SIZE/TILE))*TILE
  };
}

function gameLoop(){
  const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};
  snake.unshift(head);
  snake.pop();

  if(head.x === food.x && head.y === food.y){
    snake.push({...snake[snake.length-1]});
    food = randomFood();
  }

  if(head.x < 0 || head.x >= SIZE || head.y < 0 || head.y >= SIZE){
    reset();
  }

  ctx.clearRect(0,0,SIZE,SIZE);
  ctx.fillStyle = "lime";
  snake.forEach(p => ctx.fillRect(p.x,p.y,TILE,TILE));
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, TILE, TILE);
}

function reset(){
  alert("Game Over");
  snake = [{x:200, y:200}];
  dir = {x:TILE, y:0};
  food = randomFood();
}

setInterval(gameLoop, 120);

document.addEventListener("keydown", e=>{
  if(e.key==="w") dir={x:0,y:-TILE};
  if(e.key==="s") dir={x:0,y:TILE};
  if(e.key==="a") dir={x:-TILE,y:0};
  if(e.key==="d") dir={x:TILE,y:0};
});
