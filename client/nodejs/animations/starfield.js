var parseColor = require("./parsecolor");
var beat, interval, decay, starSpeed, friction, stars_per_interval, time = 0;

var INTERVAL_TIME = 0.01;	// seconds
var STAR_LIFETIME = 3;		// seconds

function Star (color, position, direction) {
	this.age = 0;
	this.pos = position;
	this.color = color;
	this.randomseed = Math.random();
	this.direction = direction;
}

Star.prototype.move = function (dtime) {
	this.age += dtime;
	this.pos.x += this.direction.x * dtime;
	this.pos.y += this.direction.y * dtime;

	this.direction.x *= (1 - friction * dtime);
	this.direction.y *= (1 - friction * dtime);
	if (this.age > STAR_LIFETIME) return true;
};

Star.prototype.draw = function (matrix) {
	var col;
	var age_perc = this.age / STAR_LIFETIME;
	switch (this.color) {
		case "shootingstar":
			col = { red : 255 - 255 * age_perc, green : 255 - 255 * age_perc };
			break;

		case "rainbowtime":
			col = { red :   Math.sin(age_perc * Math.PI * 2 + 0) * 255,
				green : Math.sin(age_perc * Math.PI * 2 + 2) * 255,
				blue :  Math.sin(age_perc * Math.PI * 2 + 4) * 255 };
			break;

		case "rainbow":
			col = { red :   Math.sin(this.age - time + 0) * 255,
				green : Math.sin(this.age - time + 2) * 255,
				blue :  Math.sin(this.age - time + 4) * 255 };
			break;

		case "random":
			col = { red : Math.sin(this.randomseed * 100) * 255,
				green : Math.sin(this.randomseed * 80) * 255,
				blue : Math.sin(this.randomseed * 60) * 255 };
			break;

		default:
			col = parseColor(this.color);
	}

	matrix.setPixelGlobal(Math.round(this.pos.x), Math.round(this.pos.y), col);
};

var stars = [];

function init (matrix, settings) {
	var totalWidth = matrix.getWidth();
	var totalHeight = matrix.getHeight();

	switch (settings.decay) {
		case "ultrafast":	decay = 0.1;	break;
		case "fast":		decay = 0.05;	break;
		case "normal":		decay = 0.03;	break;
		case "slow":		decay = 0.015;	break;
		default:		decay = 0.03;
	}

	switch (settings.starspeed) {
		case "ultrafast":	starSpeed = 60;	break;
		case "fast":		starSpeed = 45; break;
		case "normal":		starSpeed = 35; break;
		case "slow":		starSpeed = 25; break;
		default:		starSpeed = 35;
	}

	switch (settings.friction) {
		case "ultrahigh":	friction = 3;	break;
		case "high":		friction = 2;	break;
		case "normal":		friction = 1;	break;
		case "low":		friction = 0.5;	break;
		default:		friction = 1;
	}

	switch (settings.amount) {
		case "high":	stars_per_interval = 35; break;
		case "normal":	stars_per_interval = 20; break;
		case "low":	stars_per_interval = 10; break;
		default:	stars_per_interval = 1;
	}

	interval = setInterval(function () {
		time = time + INTERVAL_TIME;
		if (beat > decay) beat -= decay;
		else beat = 0;

		for (var j = stars.length - 1; j >= 0; j--) {
			if (stars[j].move(INTERVAL_TIME)) stars.splice(j, 1);
		}

		// Generate stars
		for (var i = 0; i <= stars_per_interval; i++) {
			if (Math.random() < beat) {
				var origin;
				if (settings.offset == "center")
					origin = { x : totalWidth / 2, y : totalHeight / 2 };
				else if (settings.offset == "bottomcenter")
					origin = { x : totalWidth / 2, y : totalHeight * (3/4) };

				var angle = Math.random() * Math.PI * 2;
				var x = Math.sin(angle) * starSpeed;
				var y = Math.cos(angle) * starSpeed;
				var direction = { x : x, y : y }; 
				stars.push(new Star(settings.color, origin, direction));
			}
		}
	}, INTERVAL_TIME * 1000);
}

function draw (matrix) {
	matrix.clear();
	for (var star in stars) stars[star].draw(matrix);
}

function event (ev) {
	if (ev == "beat") beat = 1;
}

function terminate () {
	clearInterval(interval);
}

module.exports = {
	starfield : {
		name : "Starfield",
		settings : {
			color : [ "shootingstar", "rainbow", "rainbowtime", "white", "red",
				"green", "blue", "random" ],
			decay : [ "fast", "ultrafast", "normal", "slow" ],
			starspeed : [ "normal", "ultrafast", "slow", "fast" ],
			friction : [ "normal", "low", "high", "ultrahigh" ],
			amount : [ "normal", "low", "high" ],
			offset : [ "bottomcenter", "center" ]
		},
		init : init,
		draw : draw,
		event : event,
		terminate : terminate,
		description : "Sends out stars on beat input."
	}
};
