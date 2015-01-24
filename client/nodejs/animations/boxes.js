var INTERVAL_TIME = 0.01;
var BOX_LIFETIME = 1;

var boxes = [];
var interval, beat = 0, boxes_per_interval, totalWidth, totalHeight;

function Box(x, y, dx, dy) {
	this.x = x;
	this.y = y;
	this.dx = dx;
	this.dy = dy;
	this.age = 0;
	this.xsize = 0;
	this.ysize = 0;

	var colorseed = Math.random() * 2 * Math.PI;
	this.color = {
		red : (Math.sin(colorseed + 0) + 1) * 127,
		green : (Math.sin(colorseed + 2) + 1) * 127,
		blue : (Math.sin(colorseed + 4) + 1) * 127,
	}
}

Box.prototype.tick = function (dtime) {
	this.age += dtime;
	this.xsize += this.dx * dtime;
	this.ysize += this.dy * dtime;
	if (this.xsize > 10) this.xsize = 10;
	if (this.ysize > 10) this.ysize = 10;

	if (this.age > BOX_LIFETIME) return true;
}

Box.prototype.draw = function (matrix) {
	// Top row
	for (var x = this.x - this.xsize / 2; x <= this.x + this.xsize / 2; x++)
			matrix.setPixelGlobal(Math.round(x),
				Math.round(this.y - this.ysize / 2), this.color);

	// Bottom row
	for (var x = this.x - this.xsize / 2; x <= this.x + this.xsize / 2; x++)
			matrix.setPixelGlobal(Math.round(x),
				Math.round(this.y + this.ysize / 2), this.color);

	// Left column
	for (var y = this.y - this.ysize / 2; y < this.y + this.ysize / 2; y++)
			matrix.setPixelGlobal(Math.round(this.x - this.xsize / 2),
				Math.round(y), this.color);


	// Right column
	for (var y = this.y - this.ysize / 2; y < this.y + this.ysize / 2; y++)
			matrix.setPixelGlobal(Math.round(this.x + this.xsize / 2),
				Math.round(y), this.color);
}

function init (matrix, settings) {
	totalHeight = matrix.getHeight();
	totalWidth = matrix.getWidth();

	switch (settings.decay) {
		case "ultrafast":	decay = 0.1;	break;
		case "fast":		decay = 0.05;	break;
		case "normal":		decay = 0.03;	break;
		case "slow":		decay = 0.015;	break;
		default:		decay = 0.03;
	}

	switch (settings.amount) {
		case "high":	boxes_per_interval = 4; break;
		case "normal":	boxes_per_interval = 2; break;
		case "low":	boxes_per_interval = 1; break;
		default:	boxes_per_interval = 2;
	}

	var interval = setInterval(function () {
		if (beat > decay) beat -= decay;
		else beat = 0;

		for (var j = boxes.length - 1; j >= 0; j--) {
			if (boxes[j].tick(INTERVAL_TIME)) boxes.splice(j, 1);
		}

		for (var i = 0; i <= boxes_per_interval; i++) {
			if (Math.random() * 10 < beat) {
				var x = Math.random() * totalWidth;
				var y = Math.random() * totalHeight;
				var dx = Math.random() * 30 + 45;
				var dy = Math.random() * 30 + 45;
				boxes.push(new Box(x, y, dx, dy));
			}
		}
	}, INTERVAL_TIME * 1000);
}

function draw (matrix) {
	matrix.clear();
	for (var box in boxes) {
		boxes[box].draw(matrix);
	}
}

function event (ev) {
	if (ev == "beat") beat = 1;
}

function terminate () {
	clearInterval(interval);
}

module.exports = {
	boxes : {
		name : "Boxes",
		settings : {
			decay : [ "fast", "ultrafast", "normal", "slow" ],
			amount : [ "normal", "low", "high" ]
		},
		init : init,
		draw : draw,
		event : event,
		terminate : terminate,
		description : "TODO"
	}
};
