var INTERVAL_TIME = 0.01;
var BOX_LIFETIME = 4;

var boxes = [];
var interval, beat = 0, boxes_per_interval, totalWidth, totalHeight, style, decay;

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
	this.color.red *= (1 - dtime * decay);
	this.color.green *= (1 - dtime * decay);
	this.color.blue *= (1 - dtime * decay);

	this.age += dtime;
	if (this.xsize < this.dx * 0.1) this.xsize += this.dx * dtime;
	if (this.ysize < this.dy * 0.1) this.ysize += this.dy * dtime;

	if (this.age > BOX_LIFETIME) return true;
}

Box.prototype.draw = function (matrix) {
	if (style == "empty") {
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
	} else if (style == "fill") {
		for (var x = this.x - this.xsize / 2; x < this.x + this.xsize / 2; x++) {
			for (var y = this.y - this.ysize / 2; y < this.y + this.ysize / 2; y++) {
				matrix.setPixelGlobal(Math.round(x), Math.round(y), this.color);
			}
		}
	}
}

function init (matrix, settings) {
	totalHeight = matrix.getHeight();
	totalWidth = matrix.getWidth();
	style = settings.style;

	switch (settings.decay) {
		case "ultrafast":	decay = 8;	break;
		case "fast":		decay = 5;	break;
		case "normal":		decay = 3;	break;
		case "slow":		decay = 1;	break;
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
	}, INTERVAL_TIME * 1000);
}

function draw (matrix) {
	matrix.clear();
	for (var box in boxes) {
		boxes[box].draw(matrix);
	}
}

function event (ev) {
	if (ev == "beat") {
		for (var i = 0; i < boxes_per_interval; i++) {
			var x = Math.random() * totalWidth;
			var y = Math.random() * totalHeight;
			var dx = Math.random() * 30 + 45;
			var dy = Math.random() * 30 + 45;
			boxes.push(new Box(x, y, dx, dy));
		}
	}
}

function terminate () {
	clearInterval(interval);
}

module.exports = {
	boxes : {
		name : "Boxes",
		settings : {
			amount : [ "normal", "low", "high" ],
			decay : [ "fast", "ultrafast", "normal", "slow" ],
			style : [ "empty", "fill" ]
		},
		init : init,
		draw : draw,
		event : event,
		terminate : terminate,
		description : "TODO"
	}
};
