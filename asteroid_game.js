// SOUNDS
var gameOverSound = new Audio("media/gameOver.wav");
var laserShootSound = new Audio("media/laserShoot.wav");
var explosionSound = new Audio("media/explosion.wav");
var powerUpSound = new Audio("media/powerUp.wav");
var hitHurtSound = new Audio("media/hitHurt.wav");
var hitAsteroidSound = new Audio("media/hitAsteroid.wav");

// Set SHIP default variables
var canvas = document.getElementById("asteroidsCanvas");
var shipAngle = 0;
var shipSize = 12.5;
var shipSpeed = 7;

var shipX = canvas.width / 2;
var shipY = canvas.height / 2;

// Bullets variables
var bullets = [];

// Asteroids variables
var asteroids = [];

// Score
var score = 0;
var points = 0;

// Lives
var lives = 3;
function updateLives() {
    document.getElementById("lives").innerHTML = "Lives: " + lives;
}

// Highestscores
var highestScores = [];

// DRAW SHIP
function drawShip() {
    var canvas = document.getElementById("asteroidsCanvas");
    var ctx = canvas.getContext("2d");
    //ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(shipX, shipY);
    ctx.rotate(shipAngle);
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.moveTo(0, -shipSize);
    ctx.lineTo(shipSize, shipSize);
    ctx.lineTo(-shipSize, shipSize);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Check COLLISION with ASTEROIDS
    for (var i = 0; i < asteroids.length; i++) {
        var asteroid = asteroids[i];
        var dx = shipX - asteroid.x;
        var dy = shipY - asteroid.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        // Check collision
        if (distance < asteroid.size + shipSize) {
            hitHurtSound.play()
            asteroids.splice(i, 1);
            if(lives > 0) {
                lives--;
                updateLives();
            }
            if(lives == 0) { //Reset
                gameOverSound.play();
                var name = "";
                while (name == "" || name == null) {
                var name = prompt("Game Over! Enter your name");
                }
                highestScores.push({name: name, score: score});
                highestScores.sort(function(a, b) {
                    return b.score - a.score;
                });
                highestScores = highestScores.slice(0, 5);
                displayHighestScores();

                shipX = canvas.width / 2;
                shipY = canvas.height / 2;
                shipAngle = 0;
                bullets = [];
                asteroids = [];

                score = 0;
                points = 0;
                lives = 3;

                updateLives();
                
            }
        }
    }
}

// MOVEMENT
document.addEventListener("keydown", function(event) {
    // movement
    if (event.key === "ArrowUp") {
        shipY -= shipSpeed;
    } else if (event.key === "ArrowDown") {
        shipY += shipSpeed;
    } else if (event.key === "ArrowLeft") {
        shipX -= shipSpeed;
    } else if (event.key === "ArrowRight") {
        shipX += shipSpeed;
    }

    // rotation
    if (event.key === "z") {
        shipAngle -= 0.1; // rotate left
    } else if (event.key === "c") {
        shipAngle += 0.1; // rotate right
    }

    // shooting
    if (event.key === "x" && bullets.length < 3) {
        var bullet = {
            x: shipX + Math.cos(shipAngle) * shipSize / 2,
            y: shipY + Math.sin(shipAngle) * shipSize / 2,
            angle: shipAngle - Math.PI / 2,
            speed: 5
        }
        bullets.push(bullet);
    }

    drawShip();
});

// BULLETS
document.addEventListener("keydown", function(event) {
    if (event.key === "x" && bullets.length < 3) {
        laserShootSound.play();
        var bullet = {
            x: shipX + Math.cos(shipAngle) * shipSize / 2,
            y: shipY + Math.sin(shipAngle) * shipSize / 2,
            angle: shipAngle - Math.PI / 2,
            speed: 5
        }
        bullets.push(bullet);
    }
});

// Animate BULLETS
function animateBullets() {
    console.log(points);
    // Update SCORE
    document.getElementById("score").innerHTML = "Score: " + score;
    if(points >= 1000) {
        powerUpSound.play();
        points = 0;
        lives++;
        updateLives();
    }

    var canvas = document.getElementById("asteroidsCanvas");
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < bullets.length; i++) {
        var bullet = bullets[i];
        bullet.x += Math.cos(bullet.angle) * bullet.speed;
        bullet.y += Math.sin(bullet.angle) * bullet.speed;
        ctx.fillStyle = "white";
        ctx.fillRect(bullet.x, bullet.y, 5, 5);
        // Check if bullet exited canvas
        if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
            bullets.splice(i, 1);
            i--;
        } else { // Check COLLISION with ASTEROIDS
            for (var j = 0; j < asteroids.length; j++) {
                var asteroid = asteroids[j];
                var dx = bullet.x - asteroid.x;
                var dy = bullet.y - asteroid.y;
                var distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < asteroid.size) {
                    hitAsteroidSound.play();
                    // Destroy ASTEROID and add SCORE
                    bullets.splice(i, 1);
                    asteroid.asteroidHealth -= 1;
                    asteroid.hitsTaken++;
                    if (asteroid.asteroidHealth <= 0) {
                        explosionSound.play();
                        asteroids.splice(j, 1);
                        score += asteroid.hitsTaken * 100;
                        points += asteroid.hitsTaken * 100;
                        j--;
                    }
                    // Remove bullet
                    i--;
                    break;
                }
            }
        }
    }
    
    drawShip();
    requestAnimationFrame(animateBullets);
}

animateBullets();

// ASTEROIDS
function generateAsteroid() {
    var canvas = document.getElementById("asteroidsCanvas");
    var x = Math.random() < 0.5 ? -20 : canvas.width + 20;
    var y = Math.random() < 0.5 ? -20 : canvas.height + 20;
    var direction = Math.atan2(shipY - y, shipX - x);
    var asteroidHealth = Math.floor(Math.random() * 4) + 1;
    var asteroid = {
        x: x,
        y: y,
        angle: direction,
        speed: Math.floor(Math.random() * 5) + 1,
        asteroidHealth: asteroidHealth,
        size: asteroidHealth * 10,
        hitsTaken: 0
    }
    asteroids.push(asteroid);
    return asteroid;
}

// Draw ASTEROIDS
function drawAsteroids() {
    // Remove event listener for x key press
document.removeEventListener("keydown", function(event) {
    if (event.key === "x") {
      //
    }
    var canvas = document.getElementById("asteroidsCanvas");
    var ctx = canvas.getContext("2d");
    ctx.save();
    ctx.translate(asteroid.x, asteroid.y);
    ctx.rotate(asteroid.angle);
    for (var i = 0; i < asteroids.length; i++) {
        var asteroid = asteroids[i];
        asteroid.x += Math.cos(asteroid.angle) * asteroid.speed;
        asteroid.y += Math.sin(asteroid.angle) * asteroid.speed;
        if (asteroid.asteroidHealth == 3) {
            ctx.fillStyle = "orange";
            asteroid.size = 30;
        } else if (asteroid.asteroidHealth == 2) {
            ctx.fillStyle = "yellow";
            asteroid.size = 20;
        } else if (asteroid.asteroidHealth <= 1) {
            ctx.fillStyle = "green";
            asteroid.size = 10;
        }
        else {
            ctx.fillStyle = "red";
            asteroid.size = 40;
        }
        ctx.beginPath();
        ctx.arc(asteroid.x, asteroid.y, asteroid.size, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
        ctx.restore();

        // Draw health
        ctx.font = "14px VT323";
        ctx.textAlign = "center";
        ctx.fillStyle = "black";
        ctx.fillText(asteroid.asteroidHealth, asteroid.x, asteroid.y);
    }
});
}


// Animate ASTEROIDS
function animateAsteroids() {
    var canvas = document.getElementById("asteroidsCanvas");
    var ctx = canvas.getContext("2d");
    //ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < asteroids.length; i++) {
        var asteroid = asteroids[i];
        asteroid.x += Math.cos(asteroid.angle) * asteroid.speed;
        asteroid.y += Math.sin(asteroid.angle) * asteroid.speed;
        // Check if ASTEROIDS COLLIDE with other ASTEROIDS
        for (var j = 0; j < asteroids.length; j++) {
            if (i === j) continue;
            var otherAsteroid = asteroids[j];
            var dx = asteroid.x - otherAsteroid.x;
            var dy = asteroid.y - otherAsteroid.y;
            var distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < asteroid.size + otherAsteroid.size) {
                // MIRROR DIRECTION
                asteroid.angle += Math.PI;
                otherAsteroid.angle += Math.PI;
            }
        }
        // Check if asteroid exited canvas
        if (asteroid.x < -300 || asteroid.x > canvas.width + 300 || asteroid.y < -300 || asteroid.y > canvas.height + 300) {
            asteroids.splice(i, 1);
            i--;
        }
    }

    // Draw ASTEROIDS
    for (var i = 0; i < asteroids.length; i++) {
        var asteroid = asteroids[i];
        ctx.beginPath();
        //ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        if (asteroid.asteroidHealth == 3) {
            ctx.fillStyle = "orange";
            asteroid.size = 30;
        } else if (asteroid.asteroidHealth == 2) {
            ctx.fillStyle = "yellow";
            asteroid.size = 20;
        } else if (asteroid.asteroidHealth <= 1) {
            ctx.fillStyle = "green";
            asteroid.size = 10;
        }
        else {
            ctx.fillStyle = "red";
            asteroid.size = 40;
        }
        ctx.arc(asteroid.x, asteroid.y, asteroid.size, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();

        // Draw health
        ctx.font = "14px VT323";
        ctx.textAlign = "center";
        ctx.fillStyle = "black";
        ctx.fillText(asteroid.asteroidHealth, asteroid.x, asteroid.y);
    }

    drawShip();
    drawAsteroids();
    requestAnimationFrame(animateAsteroids);
}


setInterval(generateAsteroid, 3000);
animateAsteroids();

// HIGHESTSCORES
function displayHighestScores() {
    var highestScoresList = document.getElementById("highestScores");
    highestScoresList.innerHTML = ""; // Clear the list
    for (var i = 0; i < highestScores.length; i++) {
        var score = highestScores[i];
        var name = score.name;
        var score = score.score;
        highestScoresList.innerHTML += "<li>" + name + ": " + score + "</li>";
    }
}