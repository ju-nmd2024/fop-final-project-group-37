let x = 800;
let y = 400;
let stars = [];
//test
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

function draw() {
  background(0, 0, 20); // dark blue backgorund

  // Draw stars
  for (let star of stars) {
    drawStar(star.x, star.y, star.radius1, star.radius2, 5); // Draw star with 5 points
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
