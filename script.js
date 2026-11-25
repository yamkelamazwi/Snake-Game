const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const tileSize = 20;
const tileCount = canvas.width / tileSize;

const maxLevel = 15;
const pointsPerLevel = 5;
const obstaclesPerLevel = 2;

const startingSpeed = 200;
const speedUpPerPoint = 5;
const fastestSpeed = 80;

const goldenFoodLifespan = 5000;
const goldenFoodRespawnDelay = 8000;

const stageColors = [
  { board: "#101810", snake: "#78c850" },
  { board: "#10202b", snake: "#42d9ff" },
  { board: "#24152e", snake: "#d783ff" },
  { board: "#302016", snake: "#ffae42" },
  { board: "#142b24", snake: "#55ef9b" },
  { board: "#30202b", snake: "#ff6f91" },
  { board: "#20253b", snake: "#91a7ff" },
  { board: "#302b16", snake: "#f0e34a" },
  { board: "#19302f", snake: "#45e0d0" },
  { board: "#321b1b", snake: "#ff7777" },
  { board: "#1d2c19", snake: "#b1ed52" },
  { board: "#292044", snake: "#c5a3ff" },
  { board: "#3a2117", snake: "#ff9b54" },
  { board: "#172d3a", snake: "#62c4ff" },
  { board: "#302039", snake: "#ff91e8" }
];

const snake = [{ x: 10, y: 10 }];
const obstacles = [];

const food = { x: null, y: null };
const goldenFood = { x: null, y: null };

let dx = 1;
let dy = 0;
let score = 0;
let level = 1;
let growthPending = 0;
let gameOver = false;
let paused = false;
let goldenFoodVisible = false;
let goldenFoodTimeoutId = null;
let goldenFoodRespawnTimeoutId = null;
let swipeStartX = 0;
let swipeStartY = 0;
let highScore = Number(localStorage.getItem("highScore")) || 0;

document.getElementById("score").textContent = score;
document.getElementById("high-score").textContent = highScore;
document.getElementById("level").textContent = level;

function getGameSpeed() {
  return Math.max(
    fastestSpeed,
    startingSpeed - score * speedUpPerPoint
  );
}

function isOccupied(position) {
  const snakeOccupied = snake.some(
    segment => segment.x === position.x && segment.y === position.y
  );

  const obstacleOccupied = obstacles.some(
    obstacle => obstacle.x === position.x && obstacle.y === position.y
  );

  const foodOccupied =
    food.x === position.x && food.y === position.y;

  const goldenFoodOccupied =
    goldenFoodVisible &&
    goldenFood.x === position.x &&
    goldenFood.y === position.y;

  return snakeOccupied ||
    obstacleOccupied ||
    foodOccupied ||
    goldenFoodOccupied;
}

function getRandomEmptyPosition() {
  let position;

  do {
    position = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
  } while (isOccupied(position));

  return position;
}

function placeFood(item) {
  const position = getRandomEmptyPosition();
  item.x = position.x;
  item.y = position.y;
}

function createObstacles() {
  obstacles.length = 0;
  const obstacleCount = (level - 1) * obstaclesPerLevel;

  for (let i = 0; i < obstacleCount; i++) {
    obstacles.push(getRandomEmptyPosition());
  }
}

function updateStage() {
  const newLevel = Math.min(
    maxLevel,
    Math.floor(score / pointsPerLevel) + 1
  );

  if (newLevel !== level) {
    level = newLevel;
    document.getElementById("level").textContent = level;
    createObstacles();
  }

  const colors = stageColors[level - 1];
  canvas.style.backgroundColor = colors.board;
  canvas.style.borderColor = colors.snake;
}

function showGoldenFood() {
  clearTimeout(goldenFoodTimeoutId);
  clearTimeout(goldenFoodRespawnTimeoutId);

  placeFood(goldenFood);
  goldenFoodVisible = true;

  goldenFoodTimeoutId = setTimeout(() => {
    hideGoldenFood();
  }, goldenFoodLifespan);
}

function hideGoldenFood() {
  clearTimeout(goldenFoodTimeoutId);

  goldenFoodVisible = false;
  goldenFood.x = -1;
  goldenFood.y = -1;

  clearTimeout(goldenFoodRespawnTimeoutId);
  goldenFoodRespawnTimeoutId = setTimeout(() => {
    showGoldenFood();
  }, goldenFoodRespawnDelay);
}

function drawSnake() {
  ctx.fillStyle = stageColors[level - 1].snake;

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
  ctx.fillStyle = "#ff4d4d";
  ctx.fillRect(
    food.x * tileSize,
    food.y * tileSize,
    tileSize,
    tileSize
  );

  if (goldenFoodVisible) {
    ctx.fillStyle = "#ffd700";
    ctx.beginPath();
    ctx.arc(
      goldenFood.x * tileSize + tileSize / 2,
      goldenFood.y * tileSize + tileSize / 2,
      tileSize / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}

function drawObstacles() {
  ctx.fillStyle = "#777";

  for (const obstacle of obstacles) {
    ctx.fillRect(
      obstacle.x * tileSize,
      obstacle.y * tileSize,
      tileSize,
      tileSize
    );
  }
}

function moveSnake() {
  const head = snake[0];

  const newHead = {
    x: head.x + dx,
    y: head.y + dy
  };

  if (newHead.x >= tileCount) newHead.x = 0;
  if (newHead.x < 0) newHead.x = tileCount - 1;
  if (newHead.y >= tileCount) newHead.y = 0;
  if (newHead.y < 0) newHead.y = tileCount - 1;

  snake.unshift(newHead);

  if (growthPending > 0) {
    growthPending--;
  } else {
    snake.pop();
  }
}

function updateScore(points) {
  score += points;
  document.getElementById("score").textContent = score;

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
    document.getElementById("high-score").textContent = highScore;
  }

  updateStage();
}

function checkFoodCollision() {
  const head = snake[0];

  if (head.x === food.x && head.y === food.y) {
    updateScore(1);
    growthPending++;
    placeFood(food);
  }

  if (
    goldenFoodVisible &&
    head.x === goldenFood.x &&
    head.y === goldenFood.y
  ) {
    updateScore(3);
    growthPending += 2;
    hideGoldenFood();
  }
}

function checkCollision() {
  const head = snake[0];

  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      gameOver = true;
      return;
    }
  }

  if (obstacles.some(
    obstacle => head.x === obstacle.x && head.y === obstacle.y
  )) {
    gameOver = true;
  }
}

function clearBoard() {
  ctx.fillStyle = stageColors[level - 1].board;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawMessage(title, subtitle) {
  clearBoard();
  ctx.fillStyle = "white";
  ctx.textAlign = "center";

  ctx.font = "bold 36px Arial";
  ctx.fillText(title, canvas.width / 2, 180);

  ctx.font = "18px Arial";
  ctx.fillText(subtitle, canvas.width / 2, 220);

  ctx.textAlign = "left";
}

function resetGame() {
  gameOver = false;
  paused = false;
  score = 0;
  level = 1;
  growthPending = 0;

  snake.length = 1;
  snake[0] = { x: 10, y: 10 };

  dx = 1;
  dy = 0;

  document.getElementById("score").textContent = score;
  document.getElementById("level").textContent = level;

  clearTimeout(goldenFoodTimeoutId);
  clearTimeout(goldenFoodRespawnTimeoutId);

  goldenFoodVisible = false;
  goldenFood.x = -1;
  goldenFood.y = -1;

  createObstacles();
  placeFood(food);
  showGoldenFood();
  updateStage();
}

function gameLoop() {
  if (gameOver) {
    drawMessage(
      "GAME OVER",
      "Press R or tap the board to restart"
    );
  } else if (paused) {
    drawMessage(
      "PAUSED",
      "Press Space to continue"
    );
  } else {
    clearBoard();

    moveSnake();
    checkFoodCollision();
    checkCollision();

    drawObstacles();
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

canvas.addEventListener("pointerdown", event => {
  swipeStartX = event.clientX;
  swipeStartY = event.clientY;
  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener("pointerup", event => {
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

document.addEventListener("keydown", event => {
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
    event.preventDefault();
    paused = !paused;
  }

  if (event.key.toLowerCase() === "r" && gameOver) {
    resetGame();
  }
});

createObstacles();
placeFood(food);
showGoldenFood();
updateStage();

gameLoop();
