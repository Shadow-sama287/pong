import { randomIntFromRange, randomColor, distance } from './utils/utils.js';
import { color10 } from './utils/colorArrays.js';

// Initial Setup
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

let gameStarted = false;

// Set canvas dimensions
function setCanvasDimensions() {
    if (innerWidth <= 925) {
        // Mobile: Canvas is inside a rotated container.
        // The container is 100vh wide and 100vw high (rotated).
        // We want the canvas to fit within this.
        // Note: innerWidth is the portrait width (e.g. 400), innerHeight is portrait height (e.g. 800).
        // The rotated container's "width" (visually horizontal) is innerHeight.
        // Its "height" (visually vertical) is innerWidth.

        // Let's make the canvas occupy a safe area.
        canvas.width = innerHeight * 0.9; // 90% of the long side (which is horizontal in game)
        canvas.height = innerWidth * 0.9; // 90% of the short side
    } else {
        // Desktop
        canvas.width = innerWidth - 400;
        canvas.height = innerHeight - 100;
    }
}

setCanvasDimensions();

// scoreboard defination
let scoreRight = document.getElementById("score-right");
let scoreLeft = document.getElementById("score-left");
let score1 = 0, score2 = 0;

// buttons defination
let p1UpButton = document.getElementById("p1-up-button");
let p1DownButton = document.getElementById("p1-down-button");
let p2UpButton = document.getElementById("p2-up-button");
let p2DownButton = document.getElementById("p2-down-button");

const playBtn = document.getElementById('play-btn');

playBtn.addEventListener('click', () => {
    if (!gameStarted) {
        gameStarted = true;
        playBtn.style.display = 'none'; // Hide button
    }
});

const touchZones = {
    p1Up: document.getElementById('touch-zone-p1-up'),
    p1Down: document.getElementById('touch-zone-p1-down'),
    p2Up: document.getElementById('touch-zone-p2-up'),
    p2Down: document.getElementById('touch-zone-p2-down')
};


addEventListener('resize', () => {
    setCanvasDimensions();
    init(); // Recalculate everything on resize
})

let mouse = {
    x: canvas.width / 2,
    y: canvas.height / 2
}

addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
})

let paddleSpeed = {
    left: 0,
    right: 0
};

const HIT_MULTIPLIER = 1.05;
const MAX_SPEED = 25;

// paddle movement handler
const PADDLE_SPEED = 6;

// helper funtion so thatt ball doesn't have Invalid velocity
function getVelocity() {
    let velo1 = randomIntFromRange(-7, -4);
    let velo2 = randomIntFromRange(4, 7);
    return Math.random() < 0.5 ? velo1 : velo2;
}

// ball class
class Circle {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.velocity = {
            x: getVelocity(),
            y: getVelocity()
        };
        this.radius = radius;
        this.color = color;


        this.draw = () => {
            c.beginPath();
            c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            c.fillStyle = this.color;
            c.fill();
            c.closePath();
        }

        this.update = () => {
            // comment the following condition
            if (this.x - this.radius < -30 || this.x + this.radius > canvas.width + 30) {
                this.velocity.x = - this.velocity.x;
            }
            if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) {
                this.velocity.y = - this.velocity.y;
            }
            this.x += this.velocity.x;
            this.y += this.velocity.y;

            this.draw();
        }
    }
}

// paddle class
class Paddle {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.roundedRadius = 10;
        this.isColliding = false;

        this.draw = () => {
            c.beginPath();
            const r = Math.min(this.roundedRadius, this.width / 2, this.height / 2);
            c.moveTo(this.x + r, this.y);
            c.lineTo(this.x + this.width - r, this.y);
            c.arcTo(this.x + this.width, this.y, this.x + this.width, this.y + r, r);
            c.lineTo(this.x + this.width, this.y + this.height - r);
            c.arcTo(this.x + this.width, this.y + this.height, this.x + this.width - r, this.y + this.height, r);
            c.lineTo(this.x + r, this.y + this.height);
            c.arcTo(this.x, this.y + this.height, this.x, this.y + this.height - r, r);
            c.lineTo(this.x, this.y + r);
            c.arcTo(this.x, this.y, this.x + r, this.y, r);
            c.closePath();

            c.save();
            c.fillStyle = this.color;
            c.fill();
            c.lineWidth = 1;
            c.strokeStyle = 'white';
            c.stroke();
            c.restore();
        }

        this.update = () => {
            if (paddleSpeed.left != 0) {
                leftPaddle.y += paddleSpeed.left;
            }
            if (paddleSpeed.right != 0) {
                rightPaddle.y += paddleSpeed.right;
            }

            this.y = Math.max(5, Math.min(this.y, canvas.height - this.height - 10));

            this.draw();
        }
    }
}

// paddle collision function
function checkPaddleCollision(ball, paddle, side) {
    const ballLeft = ball.x - ball.radius;
    const ballRight = ball.x + ball.radius;
    const ballTop = ball.y - ball.radius;
    const ballBottom = ball.y + ball.radius;

    const paddleLeft = paddle.x;
    const paddleRight = paddle.x + paddle.width;
    const paddleTop = paddle.y;
    const paddleBottom = paddle.y + paddle.height;

    // AABB (Axis-alligned Bounding Box) overlap
    if (
        ballRight > paddleLeft &&
        ballLeft < paddleRight &&
        ballBottom > paddleTop &&
        ballTop < paddleBottom
    ) {
        console.log("paddle collision");

        ball.velocity.x *= -1;

        // Increase ball speed with HIT_MULTIPLIER
        if (Math.abs(ball.velocity.x) < MAX_SPEED) {
            ball.velocity.x *= HIT_MULTIPLIER;
            ball.velocity.y *= HIT_MULTIPLIER;
        }

        if (side === "left") {
            ball.x = paddleRight + ball.radius;
        } else {
            ball.x = paddleLeft - ball.radius;
        }
    }
}

// score checking function
function checkScoring(ball) {
    if (ball.x + ball.radius > canvas.width) {
        score1++;
        scoreLeft.innerText = score1.toString();
        init();
    }
    if (ball.x - ball.radius < 0) {
        score2++;
        scoreRight.innerText = score2.toString();
        init();
    }
}

// KEYBOARD - paddle movement handler
addEventListener('keydown', (event) => {
    const key = event.key;

    if (key.toLowerCase() === 'w') {
        paddleSpeed.left = -PADDLE_SPEED;
        p1UpButton.classList.add('pressed');
    } else if (key.toLowerCase() === 's') {
        paddleSpeed.left = PADDLE_SPEED;
        p1DownButton.classList.add('pressed');
    }
    if (key == "ArrowUp") {
        paddleSpeed.right = -PADDLE_SPEED;
        p2UpButton.classList.add('pressed');
    } else if (key == "ArrowDown") {
        paddleSpeed.right = PADDLE_SPEED;
        p2DownButton.classList.add('pressed');
    }

    if (key === ' ' && !gameStarted) {
        gameStarted = true;
        return;
    }
});

addEventListener('keyup', (event) => {
    const key = event.key;

    if (key.toLowerCase() === 'w' || key.toLowerCase() === 's') {
        paddleSpeed.left = 0;
        p1UpButton.classList.remove('pressed')
        p1DownButton.classList.remove('pressed')
    }
    if (key === "ArrowUp" || key === "ArrowDown") {
        paddleSpeed.right = 0;
        p2UpButton.classList.remove('pressed')
        p2DownButton.classList.remove('pressed')
    }
});

// TOUCH / MOUSE - paddle movement handler
function addPaddleListeners(element, playerSide, direction) {
    const startMove = (e) => {
        // Prevent default touch behaviors (scrolling, zooming)
        if (e.cancelable) e.preventDefault();

        if (playerSide === 'left') {
            paddleSpeed.left = direction * PADDLE_SPEED;
            if (direction < 0) p1UpButton.classList.add('pressed');
            else p1DownButton.classList.add('pressed');
        } else {
            paddleSpeed.right = direction * PADDLE_SPEED;
            if (direction < 0) p2UpButton.classList.add('pressed');
            else p2DownButton.classList.add('pressed');
        }
    };

    const stopMove = (e) => {
        if (e.cancelable) e.preventDefault();

        if (playerSide === 'left') {
            paddleSpeed.left = 0;
            p1UpButton.classList.remove('pressed');
            p1DownButton.classList.remove('pressed');
        } else {
            paddleSpeed.right = 0;
            p2UpButton.classList.remove('pressed');
            p2DownButton.classList.remove('pressed');
        }
    };

    element.addEventListener('mousedown', startMove);
    element.addEventListener('touchstart', startMove, { passive: false });

    element.addEventListener('mouseup', stopMove);
    element.addEventListener('touchend', stopMove);
    element.addEventListener('touchcancel', stopMove); // Also handle cancellation
}

// Initial listeners for Desktop Buttons (Always active)
addPaddleListeners(p1UpButton, 'left', -1);
addPaddleListeners(p1DownButton, 'left', 1);
addPaddleListeners(p2UpButton, 'right', -1);
addPaddleListeners(p2DownButton, 'right', 1);

// Add listeners for Touch Zones
// Mapping based on user request:
// Top-Left (p1Up ID): Left Paddle Down
if (touchZones.p1Up) addPaddleListeners(touchZones.p1Up, 'left', 1);

// Top-Right (p2Up ID): Left Paddle Up
if (touchZones.p2Up) addPaddleListeners(touchZones.p2Up, 'left', -1);

// Bottom-Left (p1Down ID): Right Paddle Down
if (touchZones.p1Down) addPaddleListeners(touchZones.p1Down, 'right', 1);

// Bottom-Right (p2Down ID): Right Paddle Up
if (touchZones.p2Down) addPaddleListeners(touchZones.p2Down, 'right', -1);

let leftPaddle, rightPaddle, ballArray;
let paddleWidth, paddleHeight;
function init() {
    // initializing paddles
    paddleWidth = canvas.width * 0.009;
    paddleHeight = canvas.height * 0.15;

    if (paddleWidth < 5) paddleWidth = 5;
    if (paddleHeight < 15) paddleHeight = 15;

    leftPaddle = new Paddle(20, (canvas.height / 2) - (paddleHeight / 2), paddleWidth, paddleHeight, '#ff0055');
    rightPaddle = new Paddle(canvas.width - 20 - paddleWidth, (canvas.height / 2) - (paddleHeight / 2), paddleWidth, paddleHeight, '#00f2ff');

    // initializing ball
    ballArray = [];
    for (let i = 0; i < 1; i++) {
        let radius = canvas.width * 0.015;
        if (radius < 10) radius = 10;
        let x = canvas.width / 2;
        let y = canvas.height / 2;
        ballArray.push(new Circle(x, y, radius, randomColor(color10)))
    }

    // adding paddle listeners (mainly for TOUCH / MOUSE)
    addPaddleListeners(p1UpButton, 'left', -1);
    addPaddleListeners(p1DownButton, 'left', 1);
    addPaddleListeners(p2UpButton, 'right', -1);
    addPaddleListeners(p2DownButton, 'right', 1);
}

function animate() {
    requestAnimationFrame(animate);
    c.clearRect(0, 0, canvas.width, canvas.height);

    c.save();
    c.beginPath();
    c.lineWidth = 3;
    c.strokeStyle = '#0f3460';
    c.setLineDash([10, 5]);
    c.moveTo(canvas.width / 2, 0);
    c.lineTo(canvas.width / 2, canvas.height);
    c.stroke();
    c.restore();

    if (gameStarted) {
        leftPaddle.update();
        rightPaddle.update();
    } else {
        leftPaddle.draw();
        rightPaddle.draw();

        if (innerWidth > 925) {
            c.save();
            c.fillStyle = '#00ff9d';
            c.font = '20px "Press Start 2P"';
            c.textAlign = 'center';
            c.fillText('Press SPACE to start', canvas.width / 2, canvas.height - 50);
            c.restore();
        }
    }

    for (let i = 0; i < ballArray.length; i++) {
        if (gameStarted) {

            checkPaddleCollision(ballArray[i], leftPaddle, "left");
            checkPaddleCollision(ballArray[i], rightPaddle, "right");
            checkScoring(ballArray[i]);

            ballArray[i].update();
        } else {
            ballArray[i].draw();
        }

    }

    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillStyle = 'white';
    c.fillText('dattebayo', mouse.x, mouse.y)
    //call the object.update() method
}

init();
animate();