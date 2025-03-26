// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const playerNameInput = document.getElementById('playerName');
const saveScoreButton = document.getElementById('saveScore');
const highScoresList = document.getElementById('highScores');

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

// Sprite animation variables
const birdSprites = [];
const birdSpriteFrames = 3;
let currentBirdFrame = 0;
let frameCounter = 0;

// Create bird sprites
function createBirdSprites() {
    const colors = ['#FFD700', '#FFA500', '#FF8C00']; // Gold, Orange, Dark Orange

    for (let i = 0; i < birdSpriteFrames; i++) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 30;
        tempCanvas.height = 30;
        const tempCtx = tempCanvas.getContext('2d');

        // Draw bird body
        tempCtx.fillStyle = colors[i];
        tempCtx.beginPath();
        tempCtx.ellipse(15, 15, 15, 12, 0, 0, Math.PI * 2);
        tempCtx.fill();

        // Draw wing (different position for each frame)
        tempCtx.fillStyle = '#FFF';
        tempCtx.beginPath();

        if (i === 0) {
            // Wing down
            tempCtx.ellipse(10, 18, 8, 5, Math.PI / 4, 0, Math.PI * 2);
        } else if (i === 1) {
            // Wing middle
            tempCtx.ellipse(10, 15, 8, 5, 0, 0, Math.PI * 2);
        } else {
            // Wing up
            tempCtx.ellipse(10, 12, 8, 5, -Math.PI / 4, 0, Math.PI * 2);
        }

        tempCtx.fill();

        // Draw eye
        tempCtx.fillStyle = '#000';
        tempCtx.beginPath();
        tempCtx.arc(22, 12, 3, 0, Math.PI * 2);
        tempCtx.fill();

        // Draw beak
        tempCtx.fillStyle = '#FF6347'; // Tomato color
        tempCtx.beginPath();
        tempCtx.moveTo(28, 15);
        tempCtx.lineTo(35, 15);
        tempCtx.lineTo(28, 18);
        tempCtx.closePath();
        tempCtx.fill();

        // Store the sprite
        const sprite = new Image();
        sprite.src = tempCanvas.toDataURL();
        birdSprites.push(sprite);
    }
}

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
        // Update animation frame
        if (gameRunning && frames % 10 === 0) {
            currentBirdFrame = (currentBirdFrame + 1) % birdSpriteFrames;
        }

        // Rotate bird based on velocity (for diving effect)
        if (this.velocity > 5) {
            ctx.save();
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.rotate(Math.min(this.velocity / 20, Math.PI / 4));
            ctx.drawImage(birdSprites[currentBirdFrame], -this.width / 2, -this.height / 2, this.width, this.height);
            ctx.restore();
        } else {
            ctx.drawImage(birdSprites[currentBirdFrame], this.x, this.y, this.width, this.height);
        }
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

// Pipe sprites
let pipeTopSprite;
let pipeBottomSprite;

// Create pipe sprites
function createPipeSprites() {
    // Create top pipe sprite
    const topCanvas = document.createElement('canvas');
    topCanvas.width = 60;
    topCanvas.height = 400; // Max height
    const topCtx = topCanvas.getContext('2d');

    // Draw pipe body
    const gradient = topCtx.createLinearGradient(0, 0, 60, 0);
    gradient.addColorStop(0, '#006400'); // Dark green
    gradient.addColorStop(0.5, '#008000'); // Green
    gradient.addColorStop(1, '#006400'); // Dark green

    topCtx.fillStyle = gradient;
    topCtx.fillRect(0, 0, 60, 400);

    // Draw pipe border
    topCtx.strokeStyle = '#003300';
    topCtx.lineWidth = 2;
    topCtx.strokeRect(0, 0, 60, 400);

    // Draw pipe cap
    topCtx.fillStyle = '#008000';
    topCtx.fillRect(-5, 395, 70, 20);
    topCtx.strokeRect(-5, 395, 70, 20);

    // Create bottom pipe sprite (similar to top but flipped)
    const bottomCanvas = document.createElement('canvas');
    bottomCanvas.width = 60;
    bottomCanvas.height = 400;
    const bottomCtx = bottomCanvas.getContext('2d');

    // Draw pipe body
    bottomCtx.fillStyle = gradient;
    bottomCtx.fillRect(0, 0, 60, 400);

    // Draw pipe border
    bottomCtx.strokeStyle = '#003300';
    bottomCtx.lineWidth = 2;
    bottomCtx.strokeRect(0, 0, 60, 400);

    // Draw pipe cap
    bottomCtx.fillStyle = '#008000';
    bottomCtx.fillRect(-5, -15, 70, 20);
    bottomCtx.strokeRect(-5, -15, 70, 20);

    // Store sprites
    pipeTopSprite = new Image();
    pipeTopSprite.src = topCanvas.toDataURL();

    pipeBottomSprite = new Image();
    pipeBottomSprite.src = bottomCanvas.toDataURL();
}

// Pipe object constructor
function Pipe() {
    this.x = canvas.width;
    this.width = 60;
    this.gap = 150;
    this.topHeight = Math.floor(Math.random() * (canvas.height - this.gap - 100)) + 50;
    this.bottomY = this.topHeight + this.gap;

    this.draw = function() {
        // Draw top pipe (upside down)
        ctx.drawImage(pipeTopSprite, 0, pipeTopSprite.height - this.topHeight, this.width, this.topHeight, this.x, 0, this.width, this.topHeight);

        // Draw bottom pipe
        ctx.drawImage(pipeBottomSprite, 0, 0, this.width, canvas.height - this.bottomY, this.x, this.bottomY, this.width, canvas.height - this.bottomY);
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

// Leaderboard functions
function saveHighScore(name, score) {
    const highScores = getHighScores();

    // Add new score
    highScores.push({ name, score });

    // Sort scores (highest first)
    highScores.sort((a, b) => b.score - a.score);

    // Keep only top 10
    highScores.splice(10);

    // Save to localStorage
    localStorage.setItem('flappyHighScores', JSON.stringify(highScores));

    // Update display
    displayHighScores();
}

function getHighScores() {
    const highScores = localStorage.getItem('flappyHighScores');
    return highScores ? JSON.parse(highScores) : [];
}

function displayHighScores() {
    const highScores = getHighScores();

    // Clear current list
    highScoresList.innerHTML = '';

    // Add each score to the list
    highScores.forEach((score, index) => {
        const li = document.createElement('li');

        const rankSpan = document.createElement('span');
        rankSpan.className = 'rank';
        rankSpan.textContent = `${index + 1}.`;

        const nameSpan = document.createElement('span');
        nameSpan.className = 'name';
        nameSpan.textContent = score.name;

        const scoreSpan = document.createElement('span');
        scoreSpan.className = 'score';
        scoreSpan.textContent = score.score;

        li.appendChild(rankSpan);
        li.appendChild(nameSpan);
        li.appendChild(scoreSpan);

        highScoresList.appendChild(li);
    });
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

    // Reset player name input
    playerNameInput.value = '';

    // Start game loop
    frames = 0;
    animate();
}

function gameOver() {
    gameRunning = false;

    // Update final score
    finalScoreElement.textContent = score;

    // Display game over screen with leaderboard
    gameOverElement.classList.remove('hidden');

    // Display high scores
    displayHighScores();

    // Play game over sound
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

// Event listeners for leaderboard
saveScoreButton.addEventListener('click', function() {
    const name = playerNameInput.value.trim();
    if (name) {
        saveHighScore(name, score);
        playerNameInput.value = '';

        // Hide input after saving
        document.getElementById('nameInput').style.display = 'none';
    }
});

// Initialize game
window.onload = function() {
    // Create sprites
    createBirdSprites();
    createPipeSprites();

    // Draw initial state
    bird.draw();

    // Show instructions
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Press SPACE to start', canvas.width / 2, canvas.height / 2);

    // Load high scores
    displayHighScores();
};
