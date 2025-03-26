// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');

// Audio context for sound effects
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Sound effect functions
function createFlapSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(500, audioContext.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
}

function createScoringSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
}

function createGameOverSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.5);

    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
}

// Set canvas dimensions
canvas.width = 400;
canvas.height = 600;

// Game state
let gameRunning = false;
let score = 0;
let frames = 0;

// Bird object
const bird = {
    x: 50,
    y: canvas.height / 2,
    width: 30,
    height: 30,
    gravity: 0.5,
    velocity: 0,
    jump: 10,

    draw: function() {
        ctx.fillStyle = '#FFD700'; // Gold color for the bird
        ctx.fillRect(this.x, this.y, this.width, this.height);
    },

    update: function() {
        if (gameRunning) {
            this.velocity += this.gravity;
            this.y += this.velocity;

            // Check if bird hits the ground
            if (this.y + this.height >= canvas.height) {
                gameOver();
            }

            // Check if bird hits the ceiling
            if (this.y <= 0) {
                this.y = 0;
                this.velocity = 0;
            }
        }
    },

    flap: function() {
        this.velocity = -this.jump;
        createFlapSound();
    }
};

// Pipes array
const pipes = [];

// Pipe object constructor
function Pipe() {
    this.x = canvas.width;
    this.width = 60;
    this.gap = 150;
    this.topHeight = Math.floor(Math.random() * (canvas.height - this.gap - 100)) + 50;
    this.bottomY = this.topHeight + this.gap;

    this.draw = function() {
        // Draw top pipe
        ctx.fillStyle = '#008000'; // Green color for pipes
        ctx.fillRect(this.x, 0, this.width, this.topHeight);

        // Draw bottom pipe
        ctx.fillRect(this.x, this.bottomY, this.width, canvas.height - this.bottomY);
    };

    this.update = function() {
        if (gameRunning) {
            this.x -= 2; // Move pipes to the left

            // Check collision with bird
            if (
                bird.x + bird.width > this.x && 
                bird.x < this.x + this.width && 
                (bird.y < this.topHeight || bird.y + bird.height > this.bottomY)
            ) {
                gameOver();
            }

            // Check if bird passed the pipe
            if (this.x + this.width < bird.x && !this.passed) {
                score++;
                scoreElement.textContent = score;
                this.passed = true;
                createScoringSound();
            }
        }
    };
}

// Game functions
function startGame() {
    gameRunning = true;
    score = 0;
    scoreElement.textContent = score;
    gameOverElement.classList.add('hidden');

    // Reset bird position
    bird.y = canvas.height / 2;
    bird.velocity = 0;

    // Clear pipes
    pipes.length = 0;

    // Start game loop
    frames = 0;
    animate();
}

function gameOver() {
    gameRunning = false;
    gameOverElement.classList.remove('hidden');
    createGameOverSound();
}

function animate() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw bird
    bird.update();
    bird.draw();

    // Generate new pipes
    if (gameRunning && frames % 100 === 0) {
        pipes.push(new Pipe());
    }

    // Update and draw pipes
    for (let i = 0; i < pipes.length; i++) {
        pipes[i].update();
        pipes[i].draw();

        // Remove pipes that are off screen
        if (pipes[i].x + pipes[i].width < 0) {
            pipes.splice(i, 1);
            i--;
        }
    }

    frames++;

    // Continue animation loop
    if (gameRunning) {
        requestAnimationFrame(animate);
    }
}

// Event listeners
document.addEventListener('keydown', function(e) {
    if (e.code === 'Space') {
        e.preventDefault(); // Prevent scrolling when pressing space

        if (gameRunning) {
            bird.flap();
        } else {
            startGame();
        }
    }
});

// Initialize game
window.onload = function() {
    // Draw initial state
    bird.draw();

    // Show instructions
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Press SPACE to start', canvas.width / 2, canvas.height / 2);
};
