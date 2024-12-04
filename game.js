// Star variables
let x = 800;
let y = 400;
let stars = [];

// Asteroid arrays
let asteroids = [];
let miniAsteroids = [];

// Particle arrays
let sexplosionParticles = [];
let explosionParticles = [];

// Ship variables
let sx = 800;
let sy = 450;
let s = 0.5;
let angle = 0;
let vx = 0;
let vy = 0;
let thrust = 0.8;
let friction = 0.99;
let gameState="gameScreen"; //Vi måste ändra denna sen till startScreen

// Projectile variables
let projectiles = []; 
let shooting = false;
let shootTimer = 0;

function setup() {
  createCanvas(1600, 800);

  // Generate random stars
  for (let i = 0; i < 1000; i++) {
    // Increase stars
    let starX = random(0, 1600); // Randomizes stars X
    let starY = random(0, 800); // Randomizes stars Y
    let radius1 = random(1, 2); // Small stars (outer radius)
    let radius2 = radius1 / 7; // outer radius
    stars.push({ x: starX, y: starY, radius1, radius2 }); // Star properties
  }
    // Spawn initial asteroids
    for (let i = 0; i < 4; i++) {
      spawnLargeAsteroid();
    }
}
//ship 
function ship() {
  push();
  translate(sx, sy);
  rotate(angle);
  fill(120,120,220);
  stroke(120,140,220);

  // Main body
  rect(-80*s,-170*s,160*s,200 * s);
  rect(-40*s,-200*s,80*s,30*s);

  // Tip
  triangle(0*s,-240*s,-40*s,-200*s,40*s,-200*s);

  // Wing bumps
  triangle(-80*s,-170*s,-20*s,-170*s,-50*s,-200*s);
  triangle(20*s,-170*s,80*s,-170*s,50*s,-200*s);

  // Wings
  triangle(-80*s,-160*s,-80*s,20*s,-230*s,20* s);
  triangle(80*s,-160*s,80*s, 20*s,230*s,20*s);

  // Cockpit
  fill(200,200,230);
  triangle(0*s,-220*s,-30*s,-190*s,30*s,-190*s);
  pop();

  //flame function
  function flame(){
  push();
  translate(sx, sy);
  rotate(angle);
  
  // Fire
  fill(250,80,0);
  noStroke();
  triangle(-80*s,30*s,80*s,30*s,0*s,110*s);
  fill(200, 150, 0, 150);
  triangle(-60*s,40*s,60*s,40*s,0*s,100*s);
  pop();
}
  // W key/forward
  if (keyIsDown(87) && gameState === "gameScreen") {
    vx += sin(angle) * thrust;
    vy -= cos(angle) * thrust;
    flame();
  }
}

// Projectile class
class Projectile {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.vx = sin(angle) * 10;
    this.vy = -cos(angle) * 10;
    this.width = 50;
    this.height = 10;
  }
  // Update projectile position
  update() {
    this.x += this.vx;
    this.y += this.vy;
  }
  // Projectile visual
  draw() {
    push();
    fill(255, 0, 0,150);
    stroke(255,230,230,150);
    translate(this.x, this.y);
    rotate(atan2(this.vy, this.vx));
    ellipse(0, 0, this.width*s, this.height*s);
    pop();
  }
}


function draw() {
  background(0, 0, 20); // dark blue backgorund

  // Draw stars
  for (let star of stars) {
    drawStar(star.x, star.y, star.radius1, star.radius2, 5); // Draw star with 5 points
  }
  
  // Ship controls
  // S key/backwards
  if (keyIsDown(83) && gameState === "gameScreen") {
    vx -= sin(angle) * thrust;
    vy += cos(angle) * thrust;
  }
  // A key/turn left
  if (keyIsDown(65) && gameState === "gameScreen") { 
    angle -= 0.05;
  }
  // D key/turn right
  if (keyIsDown(68) && gameState === "gameScreen") { 
    angle += 0.05;
  }
  // Space key/shoot
  if (keyIsDown(32) && gameState === "gameScreen") {
    shooting = true;
  }
  else {
    shooting = false;
  }

  // Update ship position
  sx += vx;
  sy += vy;
  vx *= friction;
  vy *= friction;

  // Shooting mechanism
  if (shooting && shootTimer <= 0) {
    let tipX = sx + sin(angle) * 240 * s;
    let tipY = sy - cos(angle) * 240 * s;
    projectiles.push(new Projectile(tipX, tipY, angle));
    // Firerate
    shootTimer = 5; 
  }
  if (shootTimer > 0) shootTimer--;
  
  ship();

  // Update and draw projectiles
  for (let i = projectiles.length - 1; i >= 0; i--) {
    projectiles[i].update();
    projectiles[i].draw();

    // Remove projectiles that go off-screen
    if (projectiles[i].x < 0 || projectiles[i].x > width || projectiles[i].y < 0 || projectiles[i].y > height) {
      projectiles.splice(i, 1);
    }
  }
  updateAsteroids();
  drawAsteroids();
  sExplosion();
  drawExplosion();
}
function spawnLargeAsteroid() {
  let attempts = 0;
  let maxAttempts = 100;
  let safeToPlace = false;
  let asteroid;
  
  while (!safeToPlace && attempts < maxAttempts) {
    asteroid = {
        // Spawns at random location above the screen
      x: random(width),              
      y: random(-100, -40),          
      size: 80,       
      
      // Random movement              
      dx: random(-2, 2),           
      dy: random(1, 3),  

      type: 'large',                 
      health: 7                       
    };
  
    safeToPlace = true;
  
    // Checking to see if spawn location is empty to spawn otherwise retry somewhere else
    for (let other of asteroids) {
      if (checkCollision(asteroid, other)) {
        safeToPlace = false;
        break;
      }
    }
    attempts++;
  }
  
  if (safeToPlace) {
    asteroids.push(asteroid);
  } else {
    console.warn("Too many rocks boi");
  }
}
function spawnMiniAsteroids(x, y) {
  for (let i = 0; i < 2; i++) {
    let attempts = 0;
    let maxAttempts = 100;
    let safeToPlace = false;
    let miniAsteroid;
  
    while (!safeToPlace && attempts < maxAttempts) {
      miniAsteroid = {
        // Spawn near where the big asteroid died
        x: random(x - 20, x + 20), 
        y: random(y - 20, y + 20),
        size: 40,
        dx: random(-3, 3),
        dy: random(-3, 3),
        type: 'mini',
        health: 3,       
      };
  
      safeToPlace = true;
  
      for (let other of miniAsteroids) {
        if (checkCollision(miniAsteroid, other)) {
          safeToPlace = false;
          break;
        }
      }
      attempts++;
    }
  
    if (safeToPlace) {
      miniAsteroids.push(miniAsteroid);
    } else {
      console.warn("Could not place mini-asteroid after multiple attempts");
    }
  }
}
function updateAsteroids() {
  // Update large asteroids position
  for (let i = asteroids.length - 1; i >= 0; i--) {
    let a = asteroids[i];
    a.x += a.dx;
    a.y += a.dy;
  
    // If an asteroid goes off screen it enters from opposite size
    if (a.x - a.size / 2 > width) a.x = -a.size / 2;
    if (a.x + a.size / 2 < 0) a.x = width + a.size / 2;
    if (a.y - a.size / 2 > height) a.y = -a.size / 2;
    if (a.y + a.size / 2 < 0) a.y = height + a.size / 2;
  
    // Asteroid on asteroid collision
    for (let j = i + 1; j < asteroids.length; j++) {
      let b = asteroids[j];
      if (checkCollision(a, b)) {
        resolveCollision(a, b);
      }
    }
  
    // asteroid death checker (remove later)
    if (keyIsDown(32) && a.type === 'large' && a.health > 0) {
      a.health--;
    }
  
    // If health reaches 0, destroy asteroid and spawn mini-asteroids and explosion
    if (a.health <= 0) {
        triggerExplosion(a.x, a.y); 
      spawnMiniAsteroids(a.x, a.y);
      asteroids.splice(i, 1);
    }
  }
  
  // Update mini-asteroids position
  for (let i = miniAsteroids.length - 1; i >= 0; i--) {
    let ma = miniAsteroids[i];
    ma.x += ma.dx;
    ma.y += ma.dy;
  
    if (ma.x - ma.size / 2 > width) ma.x = -ma.size / 2;
    if (ma.x + ma.size / 2 < 0) ma.x = width + ma.size / 2;
    if (ma.y - ma.size / 2 > height) ma.y = -ma.size / 2;
    if (ma.y + ma.size / 2 < 0) ma.y = height + ma.size / 2;
  
    // asteroid death checker (remove later)
    if (keyIsDown(32) && ma.health > 0) {
      ma.health--;
    }
  
    // If mini asteroid's health reaches 0, destroy it and trigger explosion
    if (ma.health <= 0) {
      triggerExplosion(ma.x, ma.y);
      miniAsteroids.splice(i, 1);
    }
  }
}
// Small explosions exploding
function triggerExplosion(x, y) {
  for (let i = 0; i < 100; i++) {
    sexplosionParticles.push(new SexplosionParticle(x, y));
  }
}
// Big explosions exploding
function createExplosion() {
    for (let i = 0; i < 200; i++) {
      explosionParticles.push(new ExplosionParticle(explosionX, explosionY));
    }
  }

function drawAsteroids() {
  for (let a of asteroids) {
    drawLargeAsteroid(a.x, a.y, a.size);
  }
  for (let ma of miniAsteroids) {
    drawMiniAsteroid(ma.x, ma.y, ma.size);
  }
}

function drawLargeAsteroid(x, y, size) {
  fill(128, 128, 128);
  noStroke();
  ellipse(x, y, size);

  fill(100, 100, 100);
  ellipse(x - 20, y - 10, 15, 10);
  ellipse(x + 25, y + 15, 20, 12);
}

function drawMiniAsteroid(x, y, size) {
  fill(128, 128, 128);
  noStroke();
  ellipse(x, y, size);

  fill(100, 100, 100);
  ellipse(x - 10, y - 5, 7.5, 5);
  ellipse(x + 12.5, y + 7.5, 10, 6);
}

// Checks if asteroids collide
function checkCollision(a, b) {
  let distance = dist(a.x, a.y, b.x, b.y);
  return distance < (a.size + b.size) / 2;
}

// Makes asteroids bounce off eachother
function resolveCollision(a, b) {
  let normal = createVector(b.x - a.x, b.y - a.y).normalize();
  let tangent = createVector(-normal.y, normal.x);

  // Project velocities onto normal and tangent vectors
  let aNormalVelocity = normal.dot(createVector(a.dx, a.dy));
  let bNormalVelocity = normal.dot(createVector(b.dx, b.dy));
  let aTangentVelocity = tangent.dot(createVector(a.dx, a.dy));
  let bTangentVelocity = tangent.dot(createVector(b.dx, b.dy));

  // Swap normal velocities
  let aNormalVelocityAfter = bNormalVelocity;
  let bNormalVelocityAfter = aNormalVelocity;

  // Convert back to original velocity vectors
  let aNormalVector = normal.copy().mult(aNormalVelocityAfter);
  let bNormalVector = normal.copy().mult(bNormalVelocityAfter);
  let aTangentVector = tangent.copy().mult(aTangentVelocity);
  let bTangentVector = tangent.copy().mult(bTangentVelocity);

  // Update velocities
  a.dx = aNormalVector.x + aTangentVector.x;
  a.dy = aNormalVector.y + aTangentVector.y;
  b.dx = bNormalVector.x + bTangentVector.x;
  b.dy = bNormalVector.y + bTangentVector.y;
}

// Small explosion
function sExplosion() {
  for (let i = sexplosionParticles.length - 1; i >= 0; i--) {
    sexplosionParticles[i].update();
    sexplosionParticles[i].show();
    if (sexplosionParticles[i].isFinished()) {
      sexplosionParticles.splice(i, 1);
    }
  }
}
// Big explosion
function drawExplosion() {
    for (let i = explosionParticles.length - 1; i >= 0; i--) {
      explosionParticles[i].update();
      explosionParticles[i].show();
      if (explosionParticles[i].isFinished()) {
        explosionParticles.splice(i, 1);
      }
    }
  }

// Small explosion
class SexplosionParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = random(4, 8);
    this.color = color(random(255, 255), random(100, 200), random(0, 50));
    this.speed = random(1.5, 4);
    this.angle = random(TWO_PI);
    this.alpha = 255;
  }

  update() {
    this.x += this.speed * cos(this.angle);
    this.y += this.speed * sin(this.angle);
    this.size *= 0.95;
    this.alpha -= 5;
  }

  show() {
    noStroke();
    fill(red(this.color), green(this.color), blue(this.color), this.alpha);
    ellipse(this.x, this.y, this.size);
  }

  isFinished() {
    return this.alpha <= 0 || this.size < 1;
  }
}
// Big explosion
class ExplosionParticle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.size = random(8, 15);
      this.color = color(random(255, 255), random(100, 200), random(0, 50));
      this.speed = random(3, 8);
      this.angle = random(TWO_PI);
      this.alpha = 255;
    }
  
    update() {
      this.x += this.speed * cos(this.angle);
      this.y += this.speed * sin(this.angle);
      this.size *= 0.95;
      this.alpha -= 5;
    }
  
    show() {
      noStroke();
      fill(red(this.color), green(this.color), blue(this.color), this.alpha);
      ellipse(this.x, this.y, this.size);
    }
  
    isFinished() {
      return this.alpha <= 0 || this.size < 1;
    }
  }
  


// Function to draw a star
function drawStar(x, y, radius1, radius2, npoints) {
  let angle = TWO_PI / npoints; // Full circle divided by number of points
  let halfAngle = angle / 2.0; // Midway angle between points

  fill(255, 255, 255); // Set star color to white
  noStroke(); // Remove outline

  beginShape(); // Start the custom shape
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * radius1; // Outer point
    let sy = y + sin(a) * radius1;
    vertex(sx, sy); // Add vertex for outer point

    sx = x + cos(a + halfAngle) * radius2; // Inner point
    sy = y + sin(a + halfAngle) * radius2;
    vertex(sx, sy); // Add vertex for inner point
  }
  endShape(CLOSE);
}