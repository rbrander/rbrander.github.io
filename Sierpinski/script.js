const DECIMAL_RADIX = 10;
const COLOURS = ['#f49ac2', '#cb99c9', '#c23b22', '#ffd1dc', '#dea5a4', '#aec6cf'];
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const slider = document.getElementById('slider');
let size = parseInt(slider.value, DECIMAL_RADIX);

const drawTriangle = (bottomLeftX, bottomLeftY, width, height, colour = TRIANGLE_COLOUR) => {
  // short-circuit if too small
  if (width <= 1 || height <= 1) return;

  const halfWidth = (width / 2);
  const halfHeight = (height / 2);
  const midTop = {
    x: bottomLeftX + halfWidth,
    y: bottomLeftY - height,
  };
  const bottomLeft = {
    x: bottomLeftX,
    y: bottomLeftY,
  };
  const bottomRight = {
    x: bottomLeftX + width,
    y: bottomLeftY,
  };
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.moveTo(midTop.x, midTop.y);
  ctx.lineTo(bottomRight.x, bottomRight.y);
  ctx.lineTo(bottomLeft.x ,bottomLeft.y);
  ctx.lineTo(midTop.x, midTop.y);
  ctx.fill();
}

const update = (tick) => {};

const recurseTriangle = (numIterations, bottomLeftX, bottomLeftY, width, height) => {
  if (numIterations < 1) {
    // exit condition, numIterations below 1
    return;
  } else if (numIterations == 1) {
    // draw a triangle for the leaf nodes only
    drawTriangle(bottomLeftX, bottomLeftY, width, height, COLOURS[(size - 1) % COLOURS.length]);
  } else {
    // recurse, reducer iterations, shrink triangle
    const halfWidth = ~~(width / 2);
    const halfHeight = ~~(height / 2);
    const quarterWidth = ~~(width / 4);
    // bottom left
    recurseTriangle(numIterations - 1, bottomLeftX + 0, bottomLeftY, halfWidth, halfHeight);
    // bottom right
    recurseTriangle(numIterations - 1, bottomLeftX + halfWidth, bottomLeftY, halfWidth, halfHeight);
    // middle top
    recurseTriangle(numIterations - 1, bottomLeftX + quarterWidth, bottomLeftY - halfHeight, halfWidth, halfHeight);
  }
};

const draw = (tick) => {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  recurseTriangle(size, 0, canvas.height, canvas.width, canvas.height);
};

const loop = (tick) => {
  update(tick);
  draw(tick);
  requestAnimationFrame(loop);
};

const resize = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - slider.parentElement.clientHeight;
};

const onSliderChange = (e) => {
  size = parseInt(e.target.value, DECIMAL_RADIX);
};

let isDragging = false;
const onSliderMouseDown = (e) => { isDragging=true };
const onSliderMouseUp = (e) => { isDragging=false };
const onSliderMouseMove = (e) => {
  if (!isDragging) return;
  if (e.target.value !== size.toString())
    onSliderChange(e);
};

const init = () => {
  console.log('*** Sierpinski\'s Triangle ***');
  resize();
  window.addEventListener('resize', resize);
  slider.addEventListener('change', onSliderChange);
  slider.addEventListener('mousedown', onSliderMouseDown);
  slider.addEventListener('mousemove', onSliderMouseMove);
  slider.addEventListener('mouseup', onSliderMouseUp);
  slider.focus();
  requestAnimationFrame(loop);
};
init();