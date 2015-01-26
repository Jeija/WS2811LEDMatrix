var colors = [
	{ red : 255, green :   0, blue :   0},
	{ red :   0, green : 255, blue :   0},
	{ red :   0, green :   0, blue : 255},
	{ red : 255, green : 255, blue :   0},
	{ red : 255, green :   0, blue : 255},
	{ red :   0, green : 255, blue : 255}
];
var beat, interval, amount, sparkspeed, tail_length, totalWidth, totalHeight, sparks = [];
var SPARK_LIFETIME = 5;
var INTERVAL_TIME = 0.01;

function Spark (x, y, direction) {
	this.direction = direction;
	this.x = x;
	this.y = y;
	this.age = 0;
	this.color = colors[Math.floor(Math.random() * colors.length)];
}

Spark.prototype.move = function (dtime) {
	this.age += dtime;
	this.x += this.direction.x * dtime * sparkspeed;
	this.y += this.direction.y * dtime * sparkspeed;
	if (this.age > SPARK_LIFETIME) return true;
};

Spark.prototype.draw = function (matrix) {
	var x = this.x;
	var y = this.y;
	for (var t = 0; t < tail_length; t++) {
		x -= this.direction.x;
		y -= this.direction.y;
		var rgb = {};
		rgb.red = this.color.red * (1 - t / tail_length);
		rgb.green = this.color.green * (1 - t / tail_length);
		rgb.blue = this.color.blue * (1 - t / tail_length);
		matrix.setPixelGlobal(Math.round(x), Math.round(y), rgb);
	}
};

function init (matrix, settings) {
	sparks = [];
	totalWidth = matrix.getWidth();
	totalHeight = matrix.getHeight();
	sparkspeed = settings.speed;
	amount = settings.amount;
	tail_length = settings.tail;

	interval = setInterval(function () {
		for (var j = sparks.length - 1; j >= 0; j--) {
			if (sparks[j].move(INTERVAL_TIME)) sparks.splice(j, 1);
		}
	}, INTERVAL_TIME * 1000);
}

function draw (matrix) {
	matrix.clear();
	for (var spark in sparks) sparks[spark].draw(matrix);
}

function event (ev) {
	if (ev == "beat") {
		for (var n = 0; n < amount; n++) {
			// Random direction for spark
			var horizontal = Math.random() > 0.5;
			var dirx = 0, diry = 0;
			if (horizontal)
				dirx = Math.random() > 0.5 ? 1 : -1;
			else
				diry = Math.random() > 0.5 ? 1 : -1;

			// Calculate spawn position of spark
			var x, y;
			if (dirx ===  1) x = 0;
			if (dirx === -1) x = totalWidth;
			if (dirx ===  0) x = Math.random() * totalWidth;
			if (diry ===  1) y = 0;
			if (diry === -1) y = totalHeight;
			if (diry ===  0) y = Math.random() * totalHeight;

			// Spawn spark
			sparks.push(new Spark(x, y, { x : dirx, y : diry }));
		}
	}
}

function terminate () {
	clearInterval(interval);
}

module.exports = {
	nexus : {
		name : "Nexus",
		settings : {
			amount : [ "10", "3", "7", "20", "40", "60", "100" ],
			speed : [ "80", "20", "40", "60", "100", "150", 200 ],
			tail : [ "20", "1", "5", "10", "30", "50" ]
		},
		init : init,
		draw : draw,
		event : event,
		terminate : terminate,
		description : "Beat to send in the nexus sparks."
	}
};
