// javascript.js

var game;

window.onload = function() {
	var _canvas = document.getElementById('canvas');
	_canvas.width = window.innerWidth;
	_canvas.height = window.innerHeight;
	var _ctx = _canvas.getContext('2d');
	game = new Game(_canvas, _ctx);
};


function Game(_canvas, _ctx) {
	var self = this;
	self.FPS = 60;
	self.canvas = _canvas;
	self.ctx = _ctx;
	self.mousePos = {x:0,y:0};
	self.params = [];
	self.gridSize = 50;
	self.magnetOn = false;
	this.gameLoop = function() {
		self.update();
		self.draw();
	};
	self.frames = [];
	self.framecollisions = 0;
	self.inframe = false;
	this.update = function() {
		var now = new Date().valueOf();
		// remove old entries
		while (self.frames.length > 0 && (now - self.frames[0]) > 1000)
			self.frames.shift();
		// add new entry
		self.frames.push(now);
	};
	this.draw = function() {
		// draw black background
		self.ctx.fillStyle = 'black';
		self.ctx.fillRect(0, 0, self.canvas.width, self.canvas.height);
		
		// draw a grid of points
		var size = self.gridSize;
		var numY = ~~(self.canvas.height / size);
		var numX = ~~(self.canvas.width / size);
		var xOffset = ~~((self.canvas.width - ((numX - 1) * size)) / 2);
		var yOffset = ~~((self.canvas.height - ((numY - 1) * size)) / 2);
		self.ctx.fillStyle = '#2aab00';
		self.ctx.lineWidth = ~~(self.gridSize / 30) || 1;
		self.ctx.strokeStyle = '#006aef';
		self.ctx.lineCap = 'round';
		self.ctx.beginPath();
		for (var y = 0; y < numY; y++) {
			for (var x = 0; x < numX; x++) {
				// Starting coordinates of the grid
				var sx = xOffset + (x * size);
				var sy = yOffset + (y * size);
				var shaftLength = (size * 0.8);
			
				var dx = self.mousePos.x - sx;
				var dy = self.mousePos.y - sy;
				var hypot = Math.sqrt((dx * dx) + (dy * dy));
				if ((Math.abs(dy) <= shaftLength) && (Math.abs(dx) <= shaftLength)) {
					shaftLength = (hypot * 0.8);
					if (shaftLength < 0)
						shaftLength = 0;
				}
				if (shaftLength < 3) continue;
				
				// ending coordinates calculated using the angle and size
				var ang = Math.atan2(self.mousePos.y-sy, self.mousePos.x-sx);
				if (self.magnetOn && hypot > (3 * size)) ang = 0;
				var ex = sx + (shaftLength * Math.cos(ang));
				var ey = sy + (shaftLength * Math.sin(ang));
				
				// for the point, invert the angle and subtract 45 degrees
				var arrowHeadLength = (size / 5);
				var arrowHeadAngle = 45;
				var radsPerDegree = (Math.PI / 180);
				var arrowHeadRadians = arrowHeadAngle * radsPerDegree;
				var inverseAngle = (ang + Math.PI) % (2 * Math.PI);
				var leftHeadAngle = inverseAngle - arrowHeadRadians;
				var rightHeadAngle = inverseAngle + arrowHeadRadians;
				
				// draw the shaft
				self.ctx.moveTo(sx, sy);
				self.ctx.lineTo(ex, ey);
				// draw the head point
				self.ctx.moveTo(ex, ey);
				self.ctx.lineTo(ex + (arrowHeadLength * Math.cos(leftHeadAngle)), ey + (arrowHeadLength * Math.sin(leftHeadAngle)));
				self.ctx.moveTo(ex, ey);
				self.ctx.lineTo(ex + (arrowHeadLength * Math.cos(rightHeadAngle)), ey + (arrowHeadLength * Math.sin(rightHeadAngle)));
			}
		}
		self.ctx.stroke();
		
		// display frames per second
		var fps = self.frames.length;
		self.ctx.font = '20px Arial';
		self.ctx.fillStyle = '#dddd00';
		self.ctx.textBaseline = 'top';
		self.ctx.fillText('FPS: ' + fps, 10, 10);
		self.ctx.fillText('GRiD Size: ' + self.gridSize, 100, 10);
		self.ctx.fillText('C: ' + self.framecollisions, 300, 10);
	};
	this.init = function() {
		console.log('Game init at ' + (~~(1000/self.FPS)).toString());
		setInterval(self.gameLoop, ~~(1000/self.FPS));
		window.onresize = function(e) {
			self.canvas.width = window.innerWidth;
			self.canvas.height = window.innerHeight;
		};
		self.canvas.addEventListener('mousewheel', function(e) {
			var MAX = 220;
			var MIN = 10;
			var delta = ((e.deltaY / 100) * -1);
			self.gridSize += (delta * 5);
			// bounds checking
			if (self.gridSize < MIN)
				self.gridSize = MIN;
			else if (self.gridSize > MAX)
				self.gridSize = MAX;
		}, false);
		self.canvas.addEventListener('mousemove', function(e) {
			self.mousePos.x = e.clientX;
			self.mousePos.y = e.clientY;
		});
		// parse all the query string params
		window.location.search.slice(1).split('&').every(function(item, idx, items) { 
			var s = item.split('=');
			self.params.push({name: s[0], val: s[1]});
			return true;	// iterate to next one
		});
		// parse the params
		for (var i=0; i<self.params.length; i++) {
			var p = self.params[i];
			switch (p.name.toLowerCase()) {
				case 'gridsize':
					self.gridSize = parseInt(p.val);
					break;
				case 'magneton':
					self.magnetOn = (p.val.toLowerCase() == 'true');
					break;
				default:
					break;
			}
		}
	};
	this.init();
	return this;
}


