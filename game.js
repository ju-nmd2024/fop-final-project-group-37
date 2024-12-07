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
let sx = 100;//800;
let sy = 100;//450;
let s = 0.3;
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
  for (let i = 0; i < 300; i++) {
    // Increase stars
    let starX = random(0, 1600);
    let starY = random(0, 800);
    let radius1 = random(1, 2);
    let radius2 = radius1 / 7;
    stars.push({ x: starX, y: starY, radius1, radius2 });
  }
    // Spawn initial asteroids
    for (let i = 0; i < 6; i++) {
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
  background(0, 0, 20);

  // Draw stars
  for (let star of stars) {
    drawStar(star.x, star.y, star.radius1, star.radius2, 5);
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

  // If the ship goes off screen it enters from opposite size
  if (sx > width) sx = 0;
  if (sx < 0) sx = width;
  if (sy > height) sy = 0;
  if (sy < 0) sy = height;

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
  updateAsteroids();
  drawAsteroids();
  sExplosion();
  drawExplosion();

  for (let i = projectiles.length - 1; i >= 0; i--) {
    projectiles[i].update();
    projectiles[i].draw();

     // Remove projectiles that go off-screen
     if (projectiles[i].x < 0 || projectiles[i].x > width || projectiles[i].y < 0 || projectiles[i].y > height) {
      projectiles.splice(i, 1);
    }
  
    let projectileRemoved = false;
  
    // Shooting the large asteroids
  for (let j = asteroids.length - 1; j >= 0; j--) {
    let a = asteroids[j];
    if (projectiles[i]){
      let distance = dist(projectiles[i].x, projectiles[i].y, a.x, a.y);

      if (distance < a.size / 2) {
        a.health -= 1;
        projectiles.splice(i, 1);
        projectileRemoved = true;
  
        // Asteroid exploding once dead
        if (a.health <= 0) {
          triggerExplosion(a.x, a.y);
          spawnMiniAsteroids(a.x, a.y);
          asteroids.splice(j, 1);
        }
        break;
      }
    }

  }
  
    // Shooting mini asteroids
    if (!projectileRemoved) {
      for (let j = miniAsteroids.length - 1; j >= 0; j--) {
        let ma = miniAsteroids[j];
        if (projectiles[i]){
          let distance = dist(projectiles[i].x, projectiles[i].y, ma.x, ma.y);
  
          if (distance < ma.size / 2) {
            ma.health -= 1; 
            projectiles.splice(i, 1);
    
            // Mini asteroid exploding when dying
            if (ma.health <= 0) {
              triggerExplosion(ma.x, ma.y);
              miniAsteroids.splice(j, 1);
            }
            break;
          }
        }
      }
    }
  }
  
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
    console.warn("Asteroid couldnt find a place to spawn");
  }
}
function spawnMiniAsteroids(x, y) {
  for (let i = 0; i < 4; i++) {
    let attempts = 0;
    let maxAttempts = 200;
    let safeToPlace = false;
    let miniAsteroid;
  
    while (!safeToPlace && attempts < maxAttempts) {
      miniAsteroid = {
        // Spawn near where the big asteroid died
        x: random(x - 40, x + 40), 
        y: random(y - 40, y + 40),
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
      console.warn("Asteroid couldnt find a place to spawn");
    }
  }
}
function updateAsteroids() {
  // Update large asteroids position
  for (let i = asteroids.length - 1; i >= 0; i--) {
    let a = asteroids[i];
    a.x += a.dx;
    a.y += a.dy;

    // Going off the edge of the screen makes them appear on the other side
    if (a.x - a.size / 2 > width) a.x = -a.size / 2;
    if (a.x + a.size / 2 < 0) a.x = width + a.size / 2;
    if (a.y - a.size / 2 > height) a.y = -a.size / 2;
    if (a.y + a.size / 2 < 0) a.y = height + a.size / 2;

    // Check collision between asteroids
    for (let j = i + 1; j < asteroids.length; j++) {
      let b = asteroids[j];
      if (checkCollision(a, b)) {
        resolveCollision(a, b);
      }
    }

    // Check collision with mini asteroids
    for (let j = 0; j < miniAsteroids.length; j++) {
      let ma = miniAsteroids[j];
      if (checkCollision(a, ma)) {
        resolveCollision(a, ma);
      }
    }

    // Asteroid dying
    if (a.health <= 0) {
      triggerExplosion(a.x, a.y);
      spawnMiniAsteroids(a.x, a.y);
      asteroids.splice(i, 1);
    }
  }

  // Update mini asteroid position
  for (let i = miniAsteroids.length - 1; i >= 0; i--) {
    let ma = miniAsteroids[i];
    ma.x += ma.dx;
    ma.y += ma.dy;

    // Going off the edge off the screen makes them appear on the other side
    if (ma.x - ma.size / 2 > width) ma.x = -ma.size / 2;
    if (ma.x + ma.size / 2 < 0) ma.x = width + ma.size / 2;
    if (ma.y - ma.size / 2 > height) ma.y = -ma.size / 2;
    if (ma.y + ma.size / 2 < 0) ma.y = height + ma.size / 2;

    // Check collision between mini asteroids
    for (let j = i + 1; j < miniAsteroids.length; j++) {
      let other = miniAsteroids[j];
      if (checkCollision(ma, other)) {
        resolveCollision(ma, other);
      }
    }

    // Mini asteroid dying
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
  


  function drawStar(x, y, radius1, radius2, npoints) {
    // Stars
    fill(255, 255, 255);
    noStroke();
    ellipse(x, y, radius1 * 2, radius1 * 2);
  }
  