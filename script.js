const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const tileSize = 20;
const tileCount = canvas.width / tileSize;

const startingSpeed = 200;
const speedUpPerFood = 5;
const fastestSpeed = 80;

const snake = [
  { x: 10, y: 10 }
];

let dx = 1;
let dy = 0;

let gameOver = false;
let score = 0;
let growing = false;
let paused = false;
let highScore = Number(localStorage.getItem("highScore")) || 0;
let swipeStartX = 0;
let swipeStartY = 0;

const food = {
  x: Math.floor(Math.random() * tileCount),
  y: Math.floor(Math.random() * tileCount)
};

document.getElementById("score").textContent = score;
document.getElementById("high-score").textContent = highScore;

function getGameSpeed() {
  return Math.max(
    fastestSpeed,
    startingSpeed - score * speedUpPerFood
  );
}

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

  if (newHead.x >= tileCount) {
    newHead.x = 0;
  }

  if (newHead.x < 0) {
    newHead.x = tileCount - 1;
  }

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

function resetGame() {
  gameOver = false;
  paused = false;
  score = 0;

  document.getElementById("score").textContent = score;

  snake.length = 1;
  snake[0] = { x: 10, y: 10 };

  dx = 1;
  dy = 0;

  food.x = Math.floor(Math.random() * tileCount);
  food.y = Math.floor(Math.random() * tileCount);
}

function checkFoodCollision() {
  if (snake[0].x === food.x && snake[0].y === food.y) {
    score++;
    document.getElementById("score").textContent = score;

    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore);
      document.getElementById("high-score").textContent = highScore;
    }

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
  } else if (paused) {
    clearBoard();

    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.fillText("PAUSED", 100, 200);
  } else {
    clearBoard();

    moveSnake();
    checkFoodCollision();
    checkSelfCollision();

    drawFood();
    drawSnake();
  }

  setTimeout(gameLoop, getGameSpeed());
}

function changeDirection(newDx, newDy) {
  if (newDx === -dx && newDy === -dy) {
    return;
  }

  dx = newDx;
  dy = newDy;
}

canvas.addEventListener("pointerdown", (event) => {
  swipeStartX = event.clientX;
  swipeStartY = event.clientY;
  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener("pointerup", (event) => {
  if (gameOver) {
    resetGame();
    return;
  }

  const differenceX = event.clientX - swipeStartX;
  const differenceY = event.clientY - swipeStartY;
  const movement = Math.max(
    Math.abs(differenceX),
    Math.abs(differenceY)
  );

  if (movement < 20) {
    return;
  }

  if (Math.abs(differenceX) > Math.abs(differenceY)) {
    changeDirection(differenceX > 0 ? 1 : -1, 0);
  } else {
    changeDirection(0, differenceY > 0 ? 1 : -1);
  }
});

document.addEventListener("keydown", (event) => {
  const directions = {
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0]
  };

  if (directions[event.key]) {
    event.preventDefault();
    changeDirection(...directions[event.key]);
    return;
  }

  if (event.code === "Space" && !gameOver) {
    event.preventEvent = true;
    event.preventDefault();
    paused = !paused;
  }

  if (event.key.toLowerCase() === "r" && gameOver) {
    resetGame();
  }
});

gameLoop();
