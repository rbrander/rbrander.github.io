// clocks.js

const state = {};
const PADDING = 20; // pixels
const CLOCK_SIZE = 50; // pixels in diameter
const HALF_CLOCK_SIZE = ~~(CLOCK_SIZE / 2);
const BACKGROUND_COLOR = 'black';
const ACTIVE_BACKGROUND_COLOR = 'purple';
const FOREGROUND_COLOR = 'white';
const MAX_RADS = (2 * Math.PI);
const RADS_PER_HOUR = (Math.PI / 6); // Math.PI is 180degs, which is 6 o'clock
const RADS_PER_MINUTE = (Math.PI / 30); // Math.PI is 180degs, which is 30 mins
const CLOCK_HOUR_HAND_LENGTH = (HALF_CLOCK_SIZE * 0.7); // assume the hr hand is 70% of the radius
const CLOCK_MINUTE_HAND_LENGTH = (HALF_CLOCK_SIZE * 0.9); // assume the min hand is 90% of the radius
const CLOCK_CLICK_MINUTE_CHANGE = 15;

// Clock object
function Clock(hr = 12, min = 0, size = CLOCK_SIZE) {
  this.hr = hr;
  this.min = min;
  this.size = size;
  this.isActive = false;
  return this;
};
Clock.prototype.setTime = function(hr, min) {
  this.hr = hr;
  this.min = min;
};
Clock.prototype.setActive = function(isActive) {
  this.isActive = isActive;
};
Clock.prototype.onClick = function() {
  if (!this.isActive) {
    this.setActive(true);
    this.setTime(12, 0);
  } else {
    let hr = this.hr;
    let min = this.min + 15;
    if (min >= 60) {
      min = 0;
      hr++;
    }
    this.setTime(hr, min);
  }
};

Clock.prototype.draw = function(ctx, x, y) {
  // draw background if active
  if (this.isActive) {
    ctx.fillStyle = ACTIVE_BACKGROUND_COLOR;
    ctx.fillRect(x, y, CLOCK_SIZE, CLOCK_SIZE);
  }

  const middleX = (x + HALF_CLOCK_SIZE);
  const middleY = (y + HALF_CLOCK_SIZE);

  ctx.strokeStyle = FOREGROUND_COLOR;
  ctx.lineWidth = 2;

  ctx.beginPath();
  // draw the circle
  ctx.arc(middleX, middleY, HALF_CLOCK_SIZE, 0, MAX_RADS);


  // To calculate the hour hand position, the hour must be turned
  // into a radian, offset by 90 degress since 0rads is equal to 3 o'clock
  // which means we'll need to subtract 3hrs from the hour.
  // NOTE: the percentage of minutes passed is also applied
  const offsetHour = (this.hr - 3) + (this.min / 60);
  const hourRads = RADS_PER_HOUR * offsetHour;

  // draw the hour hand
  ctx.moveTo(middleX, middleY);
  ctx.lineTo(
    middleX + (Math.cos(hourRads) * CLOCK_HOUR_HAND_LENGTH),
    middleY + (Math.sin(hourRads) * CLOCK_HOUR_HAND_LENGTH)
  );

  // To calculate the minute hand position, the minute must be turned
  // into a radian, offset by 90 degress since 0rads is equal to 15 minutes
  // which means we'll need to subtract 15 mins from the min
  const offsetMin = this.min - CLOCK_CLICK_MINUTE_CHANGE;
  const minRads = RADS_PER_MINUTE * offsetMin;

  // draw the minute hand
  ctx.moveTo(middleX, middleY);
  ctx.lineTo(
    middleX + (Math.cos(minRads) * CLOCK_MINUTE_HAND_LENGTH),
    middleY + (Math.sin(minRads) * CLOCK_MINUTE_HAND_LENGTH)
  );

  ctx.stroke();
}

function update(msRunning) {
  const hr = ~~(msRunning / 1000) % 12;
  const min = ~~((msRunning / 1000) * 60) % 60;
  for (let x = 0; x < state.numXClocks; x++)
    for (let y = 0; y < state.numYClocks; y++)
      if (!state.clocks[x][y].isActive)
        state.clocks[x][y].setTime(hr, min);
}

function draw(msRunning) {
  clearCanvas();
  for (let x = 0; x < state.numXClocks; x++)
    for (let y = 0; y < state.numYClocks; y++)
      state.clocks[x][y].draw(state.ctx, PADDING + (x * CLOCK_SIZE), PADDING + (y * CLOCK_SIZE));
}

function loop(tick) {
  update(tick);
  draw(tick);
  requestAnimationFrame(loop);
}

function clickCanvas(e) {
  const mx = e.clientX;
  const my = e.clientY;
  if ((mx > PADDING) &&
      (my > PADDING) &&
      (mx < (state.canvas.width - PADDING)) &&
      (my < (state.canvas.height - PADDING))
  ) {
    const clockX = ~~((mx - PADDING) / CLOCK_SIZE);
    const clockY = ~~((my - PADDING) / CLOCK_SIZE);
    state.clocks[clockX][clockY].onClick();
  }
}

function init() {
  state.canvas = document.getElementById('canvas');
  state.ctx = state.canvas.getContext('2d');

  window.addEventListener('click', clickCanvas);
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  clearCanvas();

  // calculat the number of cocks you can fit across minus padding
  state.numXClocks = ~~((state.canvas.width - (PADDING * 2)) / CLOCK_SIZE);
  state.numYClocks = ~~((state.canvas.height - (PADDING * 2)) / CLOCK_SIZE);
  state.clocks = new Array(state.numXClocks);
  for (let x = 0; x < state.numXClocks; x++) {
    state.clocks[x] = new Array(state.numYClocks);
    for (let y = 0; y < state.numYClocks; y++) {
      state.clocks[x][y] = new Clock(12, 0, CLOCK_SIZE);
    }
  }

  state.startTime = new Date().valueOf();
  requestAnimationFrame(loop);
}

function resizeCanvas() {
  if (!state.canvas || !state.ctx) return;
  state.canvas.width = window.innerWidth;
  state.canvas.height = window.innerHeight;
}

function clearCanvas() {
  if (!state.canvas || !state.ctx) return;
  state.ctx.fillStyle = BACKGROUND_COLOR;
  state.ctx.fillRect(0, 0, state.canvas.width, state.canvas.height);
}

(function(){
  console.info(' *** Clocks.js ****');
  init();
})();
