// Star variables
let x = 800;
let y = 400;
let stars = [];

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