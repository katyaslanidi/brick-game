const canvas =  document.getElementById("my-canvas");
const restartBtn = document.getElementById("restart-btn");

const ctx = canvas.getContext("2d");
const CANVAS_WIDTH = canvas.width = 480;
const CANVAS_HEIGHT = canvas.height = 320;

//мяч
const startXPosition = CANVAS_WIDTH / 2;
const startYPosition = CANVAS_HEIGHT - 30;
let x = startXPosition;
let y = startYPosition;
const ballRadius = 10;
const startXVelocity = 2;
const startYVelocity = -2;
let xVelocity = startXVelocity;
let yVelocity = startYVelocity;
const ballColor = "lime";

//платформа
const paddleHeight = 10;
const paddleWidth = 75;
const startPaddleXPosition = (CANVAS_WIDTH - paddleWidth) / 2;
let paddleX = startPaddleXPosition;
const paddleY = CANVAS_HEIGHT - paddleHeight;
const paddleColor = "grey";
const paddleVelocity = 7;

//блоки
const brickRowCount = 3;
const brickColumnCount = 5;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;
const bricks = [];
const brickColor = "crimson";

//игра
let score = 0;
let lives = 3;
let rightPressed = false;
let leftPressed = false;
let gameFrame = 0;
let isGameRunning = true;

function changeRestartBtnDisplay(val) { //скрываем/показываем кнопку
    restartBtn.style.display = val;
}

function setStartValues() { //объявляем стартовые значения
    x = startXPosition;
    y = startYPosition;
    xVelocity = startXVelocity;
    yVelocity = startYVelocity;
    paddleX = startPaddleXPosition;
}

function fillBricksArray() { //заполняем массив блоков
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = {x: 0, y: 0, isVisible: true};
        }
    }
}

function drawBall() { //отрисовываем мяч
    ctx.beginPath();
    ctx.fillStyle = ballColor;
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2); //рисуем круг
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() { //отрисовываем платформу
    ctx.fillStyle = paddleColor;
    ctx.fillRect(paddleX, paddleY, paddleWidth, paddleHeight);
}

function drawBricks() { // отрисовываем все блоки
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const currentBrick = bricks[c][r];
            if (!currentBrick.isVisible) continue;
            const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
            const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
            currentBrick.x = brickX;
            currentBrick.y = brickY;
            ctx.fillStyle = brickColor;
            ctx.fillRect(brickX, brickY, brickWidth, brickHeight);
        }
    }
}

function drawText(text, x, y) { //отрисовываем текст
    ctx.font = "16px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(text, x, y);
}

function drawScore() { //отрисовываем кол-во очков
    drawText(`Score: ${score}`, 8, 20);
}

function drawLives() { //отрисовываем кол-во жизней
    drawText(`Lives: ${lives}`, CANVAS_WIDTH - 65, 20);
}

function checkPaddleCollision() { //проверяет столкновение мяча с платформой
    if (x > paddleX && x < paddleX + paddleWidth) {
        yVelocity = -yVelocity;
        return true;
    }
}

function checkBrickCollision() { //разбиваем блоки
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const currentBrick = bricks[c][r];
            if (!currentBrick.isVisible) continue;
            const xCollosion = x > currentBrick.x && x < currentBrick.x + brickWidth;
            const yCollision = y > currentBrick.y && y < currentBrick.y + brickHeight;
            if (xCollosion && yCollision) {
                yVelocity = -yVelocity;
                currentBrick.isVisible = false;
                score++;
                checkIfWin();
            }
        }
    }
}

function handleGameOver() { //если мяч пролетает мимо платформы
    lives--;
    if (!lives) {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        drawText(`GAME OVER!!! YOUR SCORE IS ${score}`, 50, 20);
        isGameRunning = false;
        changeRestartBtnDisplay("block");
    } else {
        setStartValues();
    }
}

function checkIfWin() { //обрабатывает победу
    if (score === brickColumnCount + brickRowCount) {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        drawText("You Win !!!", 50, 50);
        isGameRunning = false;
        changeRestartBtnDisplay("block");
    }
}

function bounceBorders() { //для того, чтобы мяч отбивался от границ поля
    const nextXPosition = x + xVelocity;
    const nextYPosition = y + yVelocity;
    if (nextXPosition < ballRadius || nextXPosition > CANVAS_WIDTH - ballRadius) {
        xVelocity = -xVelocity;
    } else if (nextYPosition < ballRadius) {
        yVelocity = -yVelocity;
    } else if (nextYPosition > CANVAS_HEIGHT - ballRadius) {
        !checkPaddleCollision() && handleGameOver();
    }
}

function movePaddle() { //двигаем платформу
    if (rightPressed) {
        paddleX = Math.min(paddleX + paddleVelocity, CANVAS_WIDTH - paddleWidth);
    } else if (leftPressed) {
        paddleX = Math.max(paddleX - paddleVelocity, 0);
    }
}

function draw() { //отрисовываем всю игру
    if(!isGameRunning) return;
    gameFrame++;
    // if (gameFrame % 2 !== 0) { // замедляем игру
    //     return requestAnimationFrame(draw);
    // }
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
    bounceBorders();
    movePaddle();
    checkBrickCollision();
    x += xVelocity; //двигаем мяч
    y +=yVelocity;
    requestAnimationFrame(draw);
}

function restartGame() {//перезапускаем игру
    changeRestartBtnDisplay("none");
    setStartValues();
    lives = 3;
    fillBricksArray();
    score = 0;
    gameFrame = 0;
    isGameRunning = true;
    draw();
}

//обработчики событий на нажатие клавишь 
function keyDownHandler(e) {
    if (e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

//обработчик событий на движение мышкой
function mouseMoveHandler(e) {
    const relativeX = e.clientX - canvas.offsetLeft;
    paddleX = relativeX - paddleWidth / 2;
}

changeRestartBtnDisplay("none");
fillBricksArray();
draw();

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);
document.addEventListener("mousemove", mouseMoveHandler);
restartBtn.addEventListener("click", restartGame);