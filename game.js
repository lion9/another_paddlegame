var animate = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  function(callback) { window.setTimeout(callback, 1000/60) };


var canvas, context;

canvas = document.getElementById('canvas');
context = canvas.getContext('2d');

var ballX;
var ballSpeedX;
var ballSpeedY;
var ballY;


// PADDLES
const PADDLE_WIDTH = 100;
const PADDLE_THICKNESS = 10;
const PADDLE_DIST_FROM_EDGE = 60;
var paddleX = 400;


// MOUSE POSITION
var mouseX;
var mouseY;

// BRICKS
const BRICK_WIDTH = 100;
const BRICK_HEIGHT = 20;
const BRICKS_COL = 8;
const BRICKS_ROW = 10;
const BRICK_GAP = 1;
const BRICK_GUTTER = 3;

var bricksGrid = [];

window.onload = function() {
    document.body.appendChild(canvas);
    createGrid();
    drawBricks();
    ballReset();
    document.addEventListener('mousemove', updateMousePos);
    animate(step);
   };

var step = function() {
    updateAll();
    animate(step);
};

// CLASSES

function Brick(x, y, w, h, fillColor) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = fillColor;
    this.isAlive = true;
}

// FUNCTIONS

function ballReset() {
    //ballX = 75;
    //ballY = 75;
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = 3;
    ballSpeedY = 3;
}

function colorCircle(centerX, centerY, diameter, fillColor) {
    context.fillStyle = fillColor;
    context.beginPath();
    context.arc(centerX, centerY, diameter, 0,Math.PI*2, true);
    context.fill();
}

function colorRect(topLeftX, topLeftY,  boxWidth, boxHeight, fillColor) {
    context.fillStyle = fillColor;
    context.fillRect(topLeftX,topLeftY, boxWidth,boxHeight);
}

function colorText(text, textX,textY, fillColor) {
    context.fillStyle = fillColor;
    context.fillText(text, textX,textY);
}

function createGrid() {
    for (var y = BRICK_GUTTER * BRICK_HEIGHT; y < BRICK_HEIGHT * BRICKS_ROW; y += BRICK_HEIGHT) {
        for (var x = 0; x < BRICK_WIDTH * BRICKS_COL; x += BRICK_WIDTH) {
            var brick = new Brick(x, y, BRICK_WIDTH - BRICK_GAP, BRICK_HEIGHT - BRICK_GAP, 'lightblue');
            bricksGrid.push(brick);
        }
    }
    
}

function drawAll() {
    // Draw canvas
    //colorRect(0, 0,  canvas.width, canvas.height, 'black');
    context.clearRect(0, 0, canvas.width, canvas.height);
    // Draw ball
    colorCircle(ballX, ballY, 10, 'white');
    // Draw paddle
    colorRect(paddleX, canvas.height - PADDLE_DIST_FROM_EDGE, PADDLE_WIDTH, PADDLE_THICKNESS, 'white');
    // Draw bricks
    drawBricks();
    // Draw mouse position
    var mouseBrickCol = Math.floor(mouseX / BRICK_WIDTH);
    var mouseBrickRow = Math.floor(mouseY / BRICK_HEIGHT);
    //colorText(mouseBrickCol + ' , ' + mouseBrickRow, mouseX,mouseY, 'yellow');

}

function drawBricks() {
    for (var i = 0; i < bricksGrid.length; i++) {
        var brick = bricksGrid[i];
        if (brick.isAlive) {
            colorRect(brick.x, brick.y, brick.w, brick.h, brick.color);
        }
    }

}

function checkCollision() {
    for (var i = 0; i < bricksGrid.length; i++) {
        var brick = bricksGrid[i];
        var prevBallCol = ballX - ballSpeedX;
        var prevBallRow = ballY - ballSpeedY;

        var prevBrickCol = Math.floor(prevBallCol / BRICK_WIDTH);
        var prevBrickRow = Math.floor(prevBallRow / BRICK_HEIGHT);

        var ballCol = Math.floor(ballX / BRICK_WIDTH);
        var ballRow = Math.floor(ballY / BRICK_HEIGHT);

        var brickCol = Math.floor(brick.x / BRICK_WIDTH);
        var brickRow = Math.floor(brick.y / BRICK_HEIGHT);

        
        if (ballCol == brickCol && ballRow == brickRow && brick.isAlive) {
                brick.isAlive = false;

                var bothTestsFailed = true;
                
                if (prevBrickCol !== ballCol && prevBrickRow !== ballRow) { // check if it's a corner hit
                    
                    // Col changed
                    var adacentTopBottom;
                    
                    for (var i = 0; i < bricksGrid.length; i++) {
                        if (bricksGrid[i].x / BRICK_WIDTH == ballCol && bricksGrid[i].y / BRICK_HEIGHT == prevBrickRow) {
                            adacentTopBottom = i;
                        }
                    }
                    // Row changed
                    var adacentSide;
                    
                    for (var i = 0; i < bricksGrid.length; i++) {
                        if (bricksGrid[i].x / BRICK_WIDTH == prevBrickCol && bricksGrid[i].y / BRICK_HEIGHT == brickRow) {
                            adacentSide = i;
                        }
                    }


                    if (typeof bricksGrid[adacentTopBottom] != 'undefined' && bricksGrid[adacentTopBottom].isAlive) {
                        ballSpeedX = -ballSpeedX;
                        bothTestsFailed = false;
                        //console.log('Top or bottom adacent: ' + adacentTopBottom);
                    } 
                    if (typeof bricksGrid[adacentSide] != 'undefined' && bricksGrid[adacentSide].isAlive) {
                        ballSpeedY = -ballSpeedY;
                        bothTestsFailed = false;
                        //console.log('Side adacent: ' + adacentTopBottom);
                    }

                    if (bothTestsFailed) {
                        ballSpeedX = -ballSpeedX;
                        ballSpeedY = -ballSpeedY;
                        //console.log('Free corner');
                    } 
                } else if (prevBrickCol != ballCol) {
                    ballSpeedX = -ballSpeedX;
                } else if (prevBrickRow != ballRow) {
                    ballSpeedY = -ballSpeedY;
            }  
        }
    }
}

function ballMove() {
    ballX += ballSpeedX;
    ballY += ballSpeedY;
}

function ballEdgesHandling() {
    if (ballX < 0 && ballSpeedX < 0.0 || ballX > canvas.width && ballSpeedX > 0.0) {
        ballSpeedX = -ballSpeedX;
    }

    if (ballY > canvas.height) {
        ballReset();
    }

    if (ballY < 0) {
        ballSpeedY = -ballSpeedY;
    }
}

function ballPaddleHandling() {
    var paddleLeftEdgeX = paddleX;
    var paddleRightEdgeX = paddleX + PADDLE_WIDTH;
    var paddleTopEdgeY = canvas.height - PADDLE_DIST_FROM_EDGE;
    var paddleBottomEdgeY = paddleTopEdgeY + PADDLE_THICKNESS;

    if (ballX > paddleLeftEdgeX && ballX < paddleRightEdgeX &&
        ballY > paddleTopEdgeY && ballY < paddleBottomEdgeY) {
            ballSpeedY = -ballSpeedY;
            var centerOfPaddle = paddleX + PADDLE_WIDTH / 2;
            var ballDistFromPaddleCenterX = ballX - centerOfPaddle;
            ballSpeedX = ballDistFromPaddleCenterX *.35;
    }
}

function moveAll() {
    ballMove();

    ballEdgesHandling();
    
    ballPaddleHandling();

    checkCollision();

}

function updateAll() {
    moveAll();
    drawAll();
}

function updateMousePos(event) {
    var rect = canvas.getBoundingClientRect();
    var root = document.documentElement;


    // temporarily for debugging 
    //ballX = event.clientX - rect.left - root.scrollLeft;
    //ballY = event.clientY - rect.top - root.scrollTop;
    mouseX = event.clientX - rect.left - root.scrollLeft;
    mouseY = event.clientY - rect.top - root.scrollTop;
    paddleX = mouseX - PADDLE_WIDTH / 2;
}
