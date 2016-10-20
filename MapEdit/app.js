// app.js -- all javascript logic for mapedit

var canvas, ctx, startTime;
var mouseX, mouseY, mouseGridX, mouseGridY, mouseClickX, mouseClickY;
var currTileOffsetX, currTileOffsetY;
var NUM_TILES_PLACE = { ONE: "1", INFINITE: "infinite" };
var numTilesToPlace = NUM_TILES_PLACE.ONE;
var isAddingTile = true;
var showTiles = true;
var imgTiles;
var map = [];
var TILE_SIZE = 32; // Each tile is 32x32 pixels
var TILE_SET_WIDTH = 8 * TILE_SIZE;
var TILE_SET_HEIGHT = 6 * TILE_SIZE;

function addTile(gridX, gridY, tileGridX, tileGridY) {
  // short-circuit if one of the values are undefined
  if (gridX === undefined || gridY === undefined || 
    tileGridX === undefined || tileGridY === undefined)
    return;

  // filter out all tht match the current locaiton, so we can replace it
  var mapWithoutCurrent = map.filter(function(item) {
    return !((item.x === gridX) && (item.y === gridY));
  });

  // create and add the new item
  var tileObj = {
    x: gridX,
    y: gridY,
    tileX: tileGridX,
    tileY: tileGridY,
  };
  map = mapWithoutCurrent.concat(tileObj);
}

function removeTile(gridX, gridY) {
  map = map.filter(function(item) {
    return !((item.x === gridX) && (item.y === gridY));
  });
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - canvas.offsetTop;
}

function onCanvasMouseMove(e) {
  mouseX = e.offsetX;
  mouseY = e.offsetY;
  mouseGridX = ~~(mouseX / TILE_SIZE);
  mouseGridY = ~~(mouseY / TILE_SIZE);
}

function onCanvasMouseOut(e) {
  mouseX = mouseY = mouseGridX = mouseGridY = undefined;
}

function onCanvasClick(e) {
  mouseClickX = e.offsetX;
  mouseClickY = e.offsetY;
  e.preventDefault();
  e.stopPropagation();
  return false;
}

function toggleShowTiles() {
  showTiles = !showTiles;
}

function toggleAddRemoveTiles(e) {
  isAddingTile = !isAddingTile;
  e.target.text = (isAddingTile ? 'Remove' : 'Add') + ' Tile';
  showTiles = isAddingTile;
}

function update(msRunning) {
  if (mouseClickX !== undefined && mouseClickY !== undefined) {
    if (showTiles) {
      // select the tile
      var isMouseInBounds = mouseClickX < TILE_SET_WIDTH && mouseClickY < TILE_SET_HEIGHT;
      if (isMouseInBounds) {
        currTileOffsetX = ~~(mouseClickX / TILE_SIZE);
        currTileOffsetY = ~~(mouseClickY / TILE_SIZE);
        toggleShowTiles();
      }
    } else {
      // place the tile on the map
      if (isAddingTile) {
        addTile(~~(mouseClickX / TILE_SIZE), ~~(mouseClickY / TILE_SIZE), 
          currTileOffsetX, currTileOffsetY);
        showTiles = (numTilesToPlace === NUM_TILES_PLACE.ONE);
      } else {
        removeTile(~~(mouseClickX / TILE_SIZE), ~~(mouseClickY / TILE_SIZE));
      }
    }
    // clear the click
    mouseClickX = mouseClickY = undefined;
  }
}

function draw(msRunning) {
  // clear background
  ctx.fillStyle = 'rgb(210, 210, 210)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // draw the gray squares to indicate transparent
  var transparentBlockSize = 10;
  var numTransparentBlocksX = ~~(canvas.width / transparentBlockSize) + 1;
  var numTransparentBlocksY = ~~(canvas.height / transparentBlockSize) + 1;
  ctx.fillStyle = 'darkgrey';
  for (var y = 0; y < numTransparentBlocksY; y++)
    for (var x = 0; x < numTransparentBlocksX; x++)
      if ((x + y) % 2 == 1)
        ctx.fillRect(x * transparentBlockSize, y * transparentBlockSize,
          transparentBlockSize, transparentBlockSize);

  // draw the map
  map.forEach(function(tile) {
    var sourceX = tile.tileX * TILE_SIZE;
    var sourceY = tile.tileY * TILE_SIZE;
    var destX = tile.x * TILE_SIZE;
    var destY = tile.y * TILE_SIZE;
    ctx.drawImage(imgTiles,
      sourceX, sourceY, TILE_SIZE, TILE_SIZE,
      destX, destY, TILE_SIZE, TILE_SIZE);
  });

  if (showTiles) {
    ctx.drawImage(imgTiles,
      0, 0, TILE_SET_WIDTH, TILE_SET_HEIGHT,
      0, 0, TILE_SET_WIDTH, TILE_SET_HEIGHT);
  }

  // draw the cursor
  var hasMouseCoords = ((mouseGridX !== undefined) && (mouseGridY !== undefined));
  var mouseIsInBounds = (!showTiles || ((mouseX < TILE_SET_WIDTH) && (mouseY < TILE_SET_HEIGHT)));
  var showCursor = hasMouseCoords && mouseIsInBounds;
  if (showCursor) {
    // Draw the selected tile
    var hasSelectedTile = ((currTileOffsetX !== undefined) && (currTileOffsetY !== undefined));
    if (!showTiles && hasSelectedTile) {
      if (isAddingTile) {
        var sourceX = currTileOffsetX * TILE_SIZE;
        var sourceY = currTileOffsetY * TILE_SIZE;
        var destX = mouseGridX * TILE_SIZE;
        var destY = mouseGridY * TILE_SIZE;
        ctx.drawImage(imgTiles,
          sourceX, sourceY, TILE_SIZE, TILE_SIZE,
          destX, destY, TILE_SIZE, TILE_SIZE);
      } else {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.fillRect(mouseGridX * TILE_SIZE, mouseGridY * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }

    // Draw the corner lines
    var lineLength = TILE_SIZE / 4;
    ctx.beginPath();

    // top left
    ctx.moveTo(mouseGridX * TILE_SIZE, mouseGridY * TILE_SIZE + lineLength);
    ctx.lineTo(mouseGridX * TILE_SIZE, mouseGridY * TILE_SIZE);
    ctx.lineTo(mouseGridX * TILE_SIZE + lineLength, mouseGridY * TILE_SIZE);

    // top right
    ctx.moveTo((mouseGridX + 1) * TILE_SIZE - lineLength, mouseGridY * TILE_SIZE);
    ctx.lineTo((mouseGridX + 1) * TILE_SIZE - 1, mouseGridY * TILE_SIZE);
    ctx.lineTo((mouseGridX + 1) * TILE_SIZE - 1, mouseGridY * TILE_SIZE + lineLength);

    // bottom right
    ctx.moveTo((mouseGridX + 1) * TILE_SIZE - 1, (mouseGridY + 1) * TILE_SIZE - lineLength);
    ctx.lineTo((mouseGridX + 1) * TILE_SIZE - 1, (mouseGridY + 1) * TILE_SIZE - 1);
    ctx.lineTo((mouseGridX + 1) * TILE_SIZE - lineLength, (mouseGridY + 1) * TILE_SIZE - 1);

    // bottom left
    ctx.moveTo(mouseGridX * TILE_SIZE + lineLength, (mouseGridY + 1) * TILE_SIZE - 1);
    ctx.lineTo(mouseGridX * TILE_SIZE, (mouseGridY + 1) * TILE_SIZE - 1);
    ctx.lineTo(mouseGridX * TILE_SIZE, (mouseGridY + 1) * TILE_SIZE - lineLength);

    ctx.lineWidth = 3;
    ctx.strokeStyle = 'magenta';
    ctx.stroke();
  }
}

function onSelectNumTilesPlaced(e) {
  numTilesToPlace = e.target.value;
}

function loop() {
  if (startTime !== undefined) {
    var msRunning = startTime - new Date().valueOf();
    update(msRunning);
    draw(msRunning);
  }
  requestAnimationFrame(loop);
}

function reset() {
  map = [];
}

function load() {
  // Create a file input, attach to DOM, then trigger via click
  var el = document.createElement('input');
  el.type = 'file';
  document.body.appendChild(el);
  el.addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (file.type !== 'application/json') {
      alert('Invalid file type; must be a json file');
    } else {
      // Read the contents of the json file and set map to the parsed contents
      var reader = new FileReader();
      reader.onload = function(e) {
        map = JSON.parse(e.target.result);
      };
      reader.readAsText(file);      
    }
  }, false);
  el.click();

  // garbage collction
  setTimeout(function(){
    document.body.removeChild(el);
  }, 0)
}

function save() {
  // create the file blob in memory
  var file = new Blob([JSON.stringify(map)], {type: 'application/json'});
  var url = URL.createObjectURL(file);
  
  // create an anchor link to trigger the client to download the blob
  var a = document.createElement("a");
  a.href = url;
  a.download = "map.json";
  document.body.appendChild(a);
  a.click();

  // garbage collect
  setTimeout(function() {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);  
  }, 0);
}

window.onload = function() {
  // setup the canvas
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  canvas.addEventListener('mousemove', onCanvasMouseMove);
  canvas.addEventListener('mouseout', onCanvasMouseOut);
  canvas.addEventListener('click', onCanvasClick);
  
  // setup the window resize event handler and call it to set the current dimensions
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // setup the tile image
  imgTiles = new Image();
  imgTiles.src = './tileset_32x32.png';
  imgTiles.onload = function() {
    startTime = new Date().valueOf();
  };

  // start the game loop
  loop();
}
