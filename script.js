const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const tileSize = 20;
const tileCount = canvas.width / tileSize;

const snake = [
  { x: 10, y: 10 }
];

let dx = 1;
let dy = 0;

const food = {
  x: Math.floor(Math.random() * tileCount),
  y: Math.floor(Math.random() * tileCount)
};

function drawSnake() {
  ctx.fillStyle = "lime";

  for (const segment of snake) {
    ctx.fillRect(
      segment.x * tileSize,
      segment.y * tileSize,
      tileSize,
      tileSize
    );
  }
}

function drawFood() {
  ctx.fillStyle = "red";

  ctx.fillRect(
    food.x * tileSize,
    food.y * tileSize,
    tileSize,
    tileSize
  );
}

function moveSnake() {
  const head = snake[0];

  const newHead = {
    x: head.x + dx,
    y: head.y + dy
  };

  // Wrap horizontally
  if (newHead.x >= tileCount) {
    newHead.x = 0;
  }

  if (newHead.x < 0) {
    newHead.x = tileCount - 1;
  }

  // Wrap vertically
  if (newHead.y >= tileCount) {
    newHead.y = 0;
  }

  if (newHead.y < 0) {
    newHead.y = tileCount - 1;
  }

  snake.unshift(newHead);

  if (!growing) {
    snake.pop();
  }

  growing = false;
}

let gameOver = false;
let score = 0;
let growing = false;
let paused = false;
let highScore = 0;

function resetGame() {
  gameOver = false;
  paused = false;

  score = 0;

  snake.length = 1;
  snake[0] = {x: 10, y: 10};

  dx = 1;
  dy = 0;

  food.x = Math.floor(Math.random() * tileCount);
  food.y = Math.floor(Math.random() * tileCount);
};

function checkFoodCollision() {
  if (snake[0].x === food.x && snake[0].y === food.y) {
    score++;

    if (score > highScore) {
      highScore = score;
    };
    growing = true;


    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);

    console.log("Food eaten!");
  }
}

function checkSelfCollision() { 
  const head = snake[0];

  for (let i = 1; i < snake.length; i++) {
    if (
      head.x === snake[i].x &&
      head.y === snake[i].y
    ) {
      
      gameOver = true;
      return;
    }
  }
}

function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";

  ctx.fillText(`Score: ${score}`, 10, 25);
  ctx.fillText(`High Score: ${highScore}`, 10, 50);
}

function clearBoard() {
  ctx.fillStyle = "black";
  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );
}

function gameLoop() {
  if (gameOver) {
    clearBoard();

    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.fillText("GAME OVER", 70, 180);

    ctx.font = "20px Arial";
    ctx.fillText("Press R to restart", 70, 230);

    return;
  }

  if (paused) {
    clearBoard();

    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.fillText("PAUSED", 100, 200);

    return;
  }

  clearBoard();

  moveSnake();
  checkFoodCollision();
  checkSelfCollision();

  drawFood();
  drawSnake();
  drawScore();
}

document.addEventListener("keydown", function(event) {
  console.log(event.key);
    if (event.code === "Space") {
    paused = !paused;
    return;
  }
  if (event.key === "r") {
  console.log("gameOver =", gameOver);
}

  if (event.key.toLowerCase() === "r" && gameOver) {
    
    resetGame();
    return;
  }


  if (event.key === "ArrowUp" && dy === 0) {
    dx = 0;
    dy = -1;
  }

  if (event.key === "ArrowDown" && dy === 0) {
    dx = 0;
    dy = 1;
  }

  if (event.key === "ArrowLeft" && dx === 0) {
    dx = -1;
    dy = 0;
  }

  if (event.key === "ArrowRight" && dx === 0) {
    dx = 1;
    dy = 0;
  }
});

setInterval(gameLoop, 200);
