const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const tileSize = 20;
const tileCount = canvas.width / tileSize;

const snake = {
  x: 10,
  y: 10
};

let dx = 1;
let dy = 0;

const food = {
  x: Math.floor(Math.random() * tileCount),
  y: Math.floor(Math.random() * tileCount)
};

function drawSnake() {
  ctx.fillStyle = "lime";

  ctx.fillRect(
    snake.x * tileSize,
    snake.y * tileSize,
    tileSize,
    tileSize
  );
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
  snake.x += dx;
  snake.y += dy;

  // Wrap horizontally
  if (snake.x >= tileCount) {
    snake.x = 0;
  }

  if (snake.x < 0) {
    snake.x = tileCount - 1;
  }

  // Wrap vertically
  if (snake.y >= tileCount) {
    snake.y = 0;
  }

  if (snake.y < 0) {
    snake.y = tileCount - 1;
  }
}

function checkFoodCollision() {
  if (snake.x === food.x && snake.y === food.y) {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);

    console.log("Food eaten!");
  }
}

function clearBoard() {
  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );
}

function gameLoop() {
  clearBoard();

  moveSnake();

  checkFoodCollision();

  drawFood();
  drawSnake();
}

document.addEventListener("keydown", function(event) {
  if (event.key === "ArrowUp") {
    dx = 0;
    dy = -1;
  }

  if (event.key === "ArrowDown") {
    dx = 0;
    dy = 1;
  }

  if (event.key === "ArrowLeft") {
    dx = -1;
    dy = 0;
  }

  if (event.key === "ArrowRight") {
    dx = 1;
    dy = 0;
  }
});

setInterval(gameLoop, 200);
