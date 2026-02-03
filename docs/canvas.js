import { randomIntFromRange, randomColor, distance } from './utils/utils.js';
import { color1, color3, color8 } from './utils/colorArrays.js';

const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

let gameStarted = false;

let refinedWidth = innerWidth - 350;
let refinedHeight = innerHeight - 75;

canvas.width = refinedWidth;
canvas.height = refinedHeight;

let scoreRight = document.getElementById("score-right");
let scoreLeft = document.getElementById("score-left");
let score1 = 0, score2 = 0;

addEventListener('resize', () => {
    canvas.width = innerWidth
    canvas.height = innerHeight

    init()
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

const PADDLE_SPEED = 6;
addEventListener('keydown', (event) => {
    const key = event.key;

    if (key == 'a' || key == 'W') {
        paddleSpeed.left = -PADDLE_SPEED;
    } else if (key == 's' || key == 'S') {
        paddleSpeed.left = PADDLE_SPEED;
    }
    if (key == "ArrowUp") {
        paddleSpeed.right = -PADDLE_SPEED;
    } else if (key == "ArrowDown") {
        paddleSpeed.right = PADDLE_SPEED;
    }

    if (key === ' ' && !gameStarted) {
        gameStarted = true;
        return;
    }
});

addEventListener('keyup', (event) => {
    const key = event.key;

    if (key.toLowerCase() === 'a' || key.toLowerCase() === 's') paddleSpeed.left = 0;
    if (key == "ArrowUp" || key === "ArrowDown") paddleSpeed.right = 0;
});

function getVelocity() {
    let velo1 = randomIntFromRange(-7, -4);
    let velo2 = randomIntFromRange(4, 7);
    return Math.random() < 0.5 ? velo1 : velo2;
}

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
            c.lineWidth = 2;
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

let leftPaddle, rightPaddle;
let ballArray;
let width = 10;
let height = 100;
function init() {
    leftPaddle = new Paddle(20, (canvas.height / 2) - (height / 2), width, height, randomColor(color1));
    rightPaddle = new Paddle(canvas.width - 20 - width, (canvas.height / 2) - (height / 2), width, height, randomColor(color3));

    ballArray = [];
    for (let i = 0; i < 1; i++) {
        let radius = 30;
        let x = canvas.width / 2;
        let y = canvas.height / 2;
        ballArray.push(new Circle(x, y, radius, randomColor(color8)))
    }
}

function animate() {
    requestAnimationFrame(animate);
    c.clearRect(0, 0, canvas.width, canvas.height);

    c.save();
    c.beginPath();
    c.lineWidth = 3;
    c.strokeStyle = 'white';
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

        c.save();
        c.fillStyle = 'white';
        c.font = '30px Verdana';
        c.textAlign = 'center';
        c.fillText('Press SPACE to start', canvas.width / 2, canvas.height - 50);
        c.restore();
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