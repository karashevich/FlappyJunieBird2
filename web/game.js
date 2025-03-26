// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const playerNameInput = document.getElementById('playerName');
const saveScoreButton = document.getElementById('saveScore');
const highScoresList = document.getElementById('highScores');
const gravityControl = document.getElementById('gravityControl');
const gravityValueDisplay = document.getElementById('gravityValue');
const speedControl = document.getElementById('speedControl');
const speedValueDisplay = document.getElementById('speedValue');
const jumpForceControl = document.getElementById('jumpForceControl');
const jumpForceValueDisplay = document.getElementById('jumpForceValue');
const backgroundMusic = document.getElementById('backgroundMusic');

// Scoreboard elements
const playerTitleElement = document.getElementById('playerTitle');
const playerNameDisplay = document.getElementById('playerNameDisplay');
const scoreDisplay = document.getElementById('scoreDisplay');
const gravityDisplay = document.getElementById('gravityDisplay');
const speedDisplay = document.getElementById('speedDisplay');
const jumpHeightDisplay = document.getElementById('jumpHeightDisplay');

// Physics controller
const physicsController = {
    gravity: 0.15, // Further reduced gravity (was 0.25)
    jumpForce: 2.67,  // Reduced jump force (was 8, now 3x less)
    speed: 1.5,    // Default speed for pipes
    baseSpeed: 1.5, // Store the base speed set by the slider
    currentSpeed: 1.5, // Current speed (may be increased based on score)

    applyGravity: function(object) {
        object.velocity += this.gravity;
        object.y += object.velocity;
    },

    applyJump: function(object) {
        object.velocity = -this.jumpForce;
    },

    setGravity: function(value) {
        this.gravity = value;
        gravityValueDisplay.textContent = value;
        gravityDisplay.textContent = value;
        updatePlayerTitle();
    },

    setSpeed: function(value) {
        this.speed = value;
        this.baseSpeed = value; // Store the base speed
        this.currentSpeed = value; // Reset current speed to base speed
        speedValueDisplay.textContent = value;
        speedDisplay.textContent = value;
        updatePlayerTitle();
    },

    setJumpForce: function(value) {
        this.jumpForce = value;
        jumpForceValueDisplay.textContent = value;
        jumpHeightDisplay.textContent = value;
        updatePlayerTitle();
    },

    // Calculate speed based on score
    calculateSpeedBasedOnScore: function(score) {
        // Increase speed by 0.1 for every 5 points, up to a maximum of 2x the base speed
        const speedIncrease = Math.min(Math.floor(score / 5) * 0.1, this.baseSpeed);
        this.currentSpeed = this.baseSpeed + speedIncrease;

        // Update the speed display
        speedDisplay.textContent = this.currentSpeed.toFixed(1);

        return this.currentSpeed;
    }
};

// Function to update player title based on physics settings
function updatePlayerTitle() {
    let title = "";
    let emoji = "";

    // Determine title based on gravity
    if (physicsController.gravity < 0.1) {
        title = "Space Bird";
        emoji = "🌌";
    } else if (physicsController.gravity > 0.3) {
        title = "Heavy Flapper";
        emoji = "🪨";
    }

    // Determine title based on speed
    if (physicsController.currentSpeed > 2.5) {
        title = "Speed Demon";
        emoji = "🔥";
    } else if (physicsController.currentSpeed < 1.0) {
        title = "Lazy Bird";
        emoji = "🐢";
    }

    // Determine title based on jump height
    if (physicsController.jumpForce > 6.0) {
        title = "Super Jumper";
        emoji = "🦘";
    } else if (physicsController.jumpForce < 1.5) {
        title = "Tiny Hopper";
        emoji = "🐜";
    }

    // If no specific title was set, use a default based on overall settings
    if (title === "") {
        if (physicsController.gravity < 0.2 && physicsController.currentSpeed > 2.0 && physicsController.jumpForce > 4.0) {
            title = "Pro Flapper";
            emoji = "🏆";
        } else if (physicsController.gravity > 0.25 && physicsController.currentSpeed < 1.5 && physicsController.jumpForce < 2.0) {
            title = "Beginner Bird";
            emoji = "🐣";
        } else {
            title = "Balanced Flyer";
            emoji = "✨";
        }
    }

    // Update the title element
    playerTitleElement.textContent = title + " " + emoji;
}

// Event listener for gravity control
gravityControl.addEventListener('input', function() {
    physicsController.setGravity(parseFloat(this.value));
});

// Event listener for speed control
speedControl.addEventListener('input', function() {
    physicsController.setSpeed(parseFloat(this.value));
});

// Event listener for jump height control
jumpForceControl.addEventListener('input', function() {
    physicsController.setJumpForce(parseFloat(this.value));
});

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

// Junie logo sprite
let junieLogoSprite = new Image();
junieLogoSprite.src = 'images/junie-logo.svg';

// Bird animation sprites
let birdSprites = [];
let currentSpriteIndex = 0;
let animationCounter = 0;
const animationSpeed = 5; // Update sprite every 5 frames

// Create bird animation sprites
function createBirdSprites() {
    // We'll create 3 sprites for the animation
    for (let i = 0; i < 3; i++) {
        const spriteCanvas = document.createElement('canvas');
        spriteCanvas.width = 40;
        spriteCanvas.height = 40;
        const spriteCtx = spriteCanvas.getContext('2d');

        // Draw the base Junie logo
        spriteCtx.drawImage(junieLogoSprite, 0, 0, 40, 40);

        // Add wing animation
        spriteCtx.fillStyle = '#FFD700'; // Gold color for wings

        if (i === 0) {
            // Wings up position
            spriteCtx.beginPath();
            spriteCtx.moveTo(5, 20);
            spriteCtx.lineTo(15, 5);
            spriteCtx.lineTo(25, 15);
            spriteCtx.closePath();
            spriteCtx.fill();
        } else if (i === 1) {
            // Wings middle position
            spriteCtx.beginPath();
            spriteCtx.moveTo(5, 20);
            spriteCtx.lineTo(20, 15);
            spriteCtx.lineTo(25, 20);
            spriteCtx.closePath();
            spriteCtx.fill();
        } else {
            // Wings down position
            spriteCtx.beginPath();
            spriteCtx.moveTo(5, 20);
            spriteCtx.lineTo(15, 30);
            spriteCtx.lineTo(25, 25);
            spriteCtx.closePath();
            spriteCtx.fill();
        }

        // Create image from canvas
        const sprite = new Image();
        sprite.src = spriteCanvas.toDataURL();
        birdSprites.push(sprite);
    }
}

// Bird object
const bird = {
    x: 50,
    y: canvas.height / 2,
    width: 40,
    height: 40,
    velocity: 0,

    draw: function() {
        // Rotate logo based on velocity (for diving effect)
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

        // Calculate rotation based on velocity
        // This creates a more natural rotation that follows the gravitational arc
        const rotationAngle = Math.atan2(this.velocity, 5);
        ctx.rotate(rotationAngle);

        // Draw the current sprite from the animation
        if (birdSprites.length > 0) {
            ctx.drawImage(birdSprites[currentSpriteIndex], -this.width / 2, -this.height / 2, this.width, this.height);
        } else {
            // Fallback to the static logo if sprites aren't loaded yet
            ctx.drawImage(junieLogoSprite, -this.width / 2, -this.height / 2, this.width, this.height);
        }

        ctx.restore();
    },

    update: function() {
        if (gameRunning) {
            // Use physics controller to apply gravity
            physicsController.applyGravity(this);

            // Check if bird hits the ground
            if (this.y + this.height >= canvas.height) {
                gameOver();
            }

            // Check if bird hits the ceiling
            if (this.y <= 0) {
                this.y = 0;
                this.velocity = 0;
            }

            // Update animation
            if (birdSprites.length > 0) {
                animationCounter++;
                if (animationCounter >= animationSpeed) {
                    animationCounter = 0;
                    currentSpriteIndex = (currentSpriteIndex + 1) % birdSprites.length;
                }
            }
        }
    },

    flap: function() {
        // Use physics controller to apply jump
        physicsController.applyJump(this);
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
    this.gap = 300; // Doubled the gap (was 150)
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
            // Use the current speed which may be increased based on score
            this.x -= physicsController.currentSpeed;

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
                scoreDisplay.textContent = score;
                this.passed = true;
                createScoringSound();

                // Calculate new speed based on updated score
                physicsController.calculateSpeedBasedOnScore(score);
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

    // Keep only top 5
    highScores.splice(5);

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

// Music control functions
function playBackgroundMusic() {
    // Play the background music
    backgroundMusic.play().catch(error => {
        console.log("Audio playback failed: ", error);
    });
}

function pauseBackgroundMusic() {
    // Pause the background music
    backgroundMusic.pause();
}

// Game functions
function startGame() {
    gameRunning = true;
    score = 0;
    scoreElement.textContent = score;
    scoreDisplay.textContent = score;
    gameOverElement.classList.add('hidden');

    // Reset bird position
    bird.y = canvas.height / 2;
    bird.velocity = 0;

    // Clear pipes
    pipes.length = 0;

    // Reset player name input
    playerNameInput.value = '';

    // Reset speed to base speed
    physicsController.currentSpeed = physicsController.baseSpeed;

    // Update scoreboard values
    gravityDisplay.textContent = physicsController.gravity;
    speedDisplay.textContent = physicsController.currentSpeed;
    jumpHeightDisplay.textContent = physicsController.jumpForce;
    updatePlayerTitle();

    // Play background music
    playBackgroundMusic();

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

    // Pause background music
    pauseBackgroundMusic();
}

// Function to draw brick background
function drawBrickBackground() {
    const brickWidth = 40;
    const brickHeight = 20;
    const rows = Math.ceil(canvas.height / brickHeight);
    const cols = Math.ceil(canvas.width / brickWidth);

    // Set background to dark grey
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            // Alternate between black and dark grey bricks
            ctx.fillStyle = (row + col) % 2 === 0 ? '#000000' : '#444444';

            // Add offset to every other row for brick pattern
            const offsetX = row % 2 === 0 ? 0 : brickWidth / 2;

            ctx.fillRect(
                col * brickWidth + offsetX, 
                row * brickHeight, 
                brickWidth, 
                brickHeight
            );

            // Draw mortar lines
            ctx.strokeStyle = '#555555';
            ctx.lineWidth = 1;
            ctx.strokeRect(
                col * brickWidth + offsetX, 
                row * brickHeight, 
                brickWidth, 
                brickHeight
            );
        }
    }
}

function animate() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw brick background
    drawBrickBackground();

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
        }
    } else if (e.code === 'Enter') {
        e.preventDefault(); // Prevent form submission

        if (!gameRunning) {
            // If there's a name in the input field, save it before starting a new game
            const name = playerNameInput.value.trim();
            if (name) {
                saveHighScore(name, score);
                playerNameInput.value = '';

                // Update player name in scoreboard for next game
                playerNameDisplay.textContent = name;

                // Hide input after saving
                document.getElementById('nameInput').style.display = 'none';
            }

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

        // Update player name in scoreboard for next game
        playerNameDisplay.textContent = name;

        // Hide input after saving
        document.getElementById('nameInput').style.display = 'none';
    }
});

// Initialize game
window.onload = function() {
    // Create pipe sprites
    createPipeSprites();

    // Wait for the Junie logo to load before creating bird sprites
    junieLogoSprite.onload = function() {
        createBirdSprites();
    };

    // If the image is already loaded (from cache), create sprites immediately
    if (junieLogoSprite.complete) {
        createBirdSprites();
    }

    // Initialize background music
    backgroundMusic.volume = 0.5; // Set volume to 50%

    // Initialize gravity control
    gravityControl.value = physicsController.gravity;
    gravityValueDisplay.textContent = physicsController.gravity;
    gravityDisplay.textContent = physicsController.gravity;

    // Initialize speed control
    speedControl.value = physicsController.speed;
    speedValueDisplay.textContent = physicsController.speed;
    speedDisplay.textContent = physicsController.speed;
    physicsController.currentSpeed = physicsController.speed; // Initialize currentSpeed

    // Initialize jump height control
    jumpForceControl.value = physicsController.jumpForce;
    jumpForceValueDisplay.textContent = physicsController.jumpForce;
    jumpHeightDisplay.textContent = physicsController.jumpForce;

    // Initialize player title
    updatePlayerTitle();

    // Try to get player name from localStorage
    const highScores = getHighScores();
    if (highScores.length > 0) {
        // Use the name of the last player who saved a score
        playerNameDisplay.textContent = highScores[0].name;
    }

    // Draw initial state
    drawBrickBackground();
    bird.draw();

    // Show instructions
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Press ENTER to start', canvas.width / 2, canvas.height / 2);

    // Load high scores
    displayHighScores();
};
