/* Make a frogger game in javascript */
var canvas = document.createElement('canvas');
canvas.width = 600;
canvas.height = 400;
document.body.appendChild(canvas);
var ctx = canvas.getContext('2d');
var frog = {
  x: canvas.width / 2,
  y: canvas.height - 30,
  width: 30,
  height: 30,
  color: 'green',
  draw: function() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
};
var car = {
  x: 0,
  y: 0,
  width: 30,
  height: 30,
  color: 'red',
  draw: function() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
};
var cars = [];
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  frog.draw();
  for (var i = 0; i < cars.length; i++) {
    cars[i].draw();
  }
}
function update() {
  for (var i = 0; i < cars.length; i++) {
    cars[i].x += 1;
  }
}
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
function addCar() {
  var newCar = Object.create(car);
  newCar.x = 0;
  newCar.y = Math.random() * canvas.height;
  cars.push(newCar);
}
setInterval(addCar, 1000);
loop();
/* Allow me to control the frog in the game. */
document.addEventListener('keydown', function(e) {
  if (e.keyCode === 37) {
    frog.x -= 10;
  } else if (e.keyCode === 38) {
    frog.y -= 10;
  } else if (e.keyCode === 39) {
    frog.x += 10;
  } else if (e.keyCode === 40) {
    frog.y += 10;
  }
});
/* Stop the game if the frog touches a car. */
function checkCollision() {
  for (var i = 0; i < cars.length; i++) {
    if (frog.x < cars[i].x + cars[i].width &&
        frog.x + frog.width > cars[i].x &&
        frog.y < cars[i].y + cars[i].height &&
        frog.y + frog.height > cars[i].y) {
      alert('Game Over');
      return;
    }
  }
}

/* Replace green square with a picture of a frog. */
var frogImage = new Image();
frogImage.src = 'http://www.clipartbest.com/cliparts/9cz/o6e/9czo6eRdi.png';
frog.draw = function() {
  ctx.drawImage(frogImage, this.x, this.y, this.width, this.height);
};