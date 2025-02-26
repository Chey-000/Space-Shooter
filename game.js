const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const welcomeScreen = document.getElementById('welcome-screen');
const startButton = document.getElementById('get-started');

// Audio setup
const shootSound = new Audio('shoot.wav');
const explosionSound = new Audio('explosion.wav');

let gameActive = false;
let player, bullets, enemies, stars, score;

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Player object
player = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    width: 40,
    height: 20,
    speed: 5
};

// Game state
bullets = [];
enemies = [];
stars = [];
score = 0;

// Create animated stars
function createStars() {
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            speed: Math.random() * 2 + 1
        });
    }
}

// Animate stars
function updateStars() {
    stars.forEach(star => {
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    });
}

function drawStars() {
    ctx.fillStyle = 'white';
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Welcome screen animation
function welcomeAnimation() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateStars();
    drawStars();
    if (!gameActive) requestAnimationFrame(welcomeAnimation);
}

// Start game
startButton.addEventListener('click', () => {
    welcomeScreen.style.display = 'none';
    canvas.style.display = 'block';
    gameActive = true;
    startGame();
});

// Player movement with cursor
canvas.addEventListener('mousemove', (e) => {
    player.x = e.clientX - player.width / 2;
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
});

// Shooting with sound
canvas.addEventListener('click', () => {
    if (gameActive) {
        bullets.push({
            x: player.x + player.width / 2 - 2,
            y: player.y,
            width: 4,
            height: 10,
            speed: 7
        });
        shootSound.play().catch(err => console.log("Audio error:", err));
    }
});

// Enemy creation
function spawnEnemy() {
    enemies.push({
        x: Math.random() * (canvas.width - 30),
        y: -30,
        width: 30,
        height: 20,
        speed: 3
    });
    setTimeout(spawnEnemy, Math.random() * 2000 + 1000);
}

// Draw player
function drawPlayer() {
    ctx.fillStyle = 'cyan';
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Draw bullets
function drawBullets() {
    ctx.fillStyle = 'yellow';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

// Draw enemies
function drawEnemies() {
    ctx.fillStyle = 'red';
    enemies.forEach(enemy => {
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

// Update game objects
function updateGame() {
    bullets.forEach((bullet, bIndex) => {
        bullet.y -= bullet.speed;
        if (bullet.y < 0) bullets.splice(bIndex, 1);
    });

    enemies.forEach((enemy, eIndex) => {
        enemy.y += enemy.speed;
        if (enemy.y > canvas.height) {
            endGame();
        }
        // Collision with player
        if (enemy.y + enemy.height > player.y &&
            enemy.x < player.x + player.width &&
            enemy.x + enemy.width > player.x) {
            endGame();
        }
        // Collision with bullets
        bullets.forEach((bullet, bIndex) => {
            if (bullet.y < enemy.y + enemy.height &&
                bullet.x > enemy.x &&
                bullet.x < enemy.x + enemy.width) {
                enemies.splice(eIndex, 1);
                bullets.splice(bIndex, 1);
                score += 10;
                explosionSound.play().catch(err => console.log("Audio error:", err));
            }
        });
    });
}

// Main game loop
function gameLoop() {
    if (!gameActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateStars();
    drawStars();
    drawPlayer();
    drawBullets();
    drawEnemies();
    updateGame();

    // Draw score
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);

    requestAnimationFrame(gameLoop);
}

// End game
function endGame() {
    gameActive = false;
    ctx.fillStyle = 'white';
    ctx.font = '40px Arial';
    ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2 - 20);
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width / 2 - 50, canvas.height / 2 + 20);
    ctx.fillText('Click to Restart', canvas.width / 2 - 80, canvas.height / 2 + 50);
    canvas.addEventListener('click', restartGame, { once: true });
}

// Restart game
function restartGame() {
    bullets = [];
    enemies = [];
    score = 0;
    player.x = canvas.width / 2;
    gameActive = true;
    spawnEnemy();
    gameLoop();
}

// Start the game
function startGame() {
    spawnEnemy();
    gameLoop();
}

// Initialize stars and welcome screen
createStars();
welcomeAnimation();