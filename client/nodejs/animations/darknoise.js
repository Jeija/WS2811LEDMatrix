var SimplexNoise = require("simplex-noise");
var parseColor = require("./parsecolor");
var simplex = new SimplexNoise();
var INTERVAL_TIME = 0.01;
var SIZE_DIVISOR = 20;
var TIME_DIVISOR = 100;
var BEAT_TIME_COEFF = 0.6;
var RAINBOW_TIME_COEFF = 0.2;

var time, beat, globalWidth, globalHeight, interval, decay, color, rainbowtime;

function init (matrix, settings) {
	rainbowtime = 0;
	time = 0;
	beat = 0;

	globalWidth = matrix.getWidth();
	globalHeight = matrix.getHeight();

	color = settings.color;

	switch (settings.decay) {
		case "ultrafast": decay = 0.025; break;
		case "fast": decay = 0.015; break;
		case "normal": decay = 0.0075; break;
		case "slow": decay = 0.0025; break;
	}

	interval = setInterval(function () {
		time += INTERVAL_TIME;
		rainbowtime += INTERVAL_TIME;
		time += beat * BEAT_TIME_COEFF;
		if (beat > decay) beat -= decay;
		else beat = 0;
	}, INTERVAL_TIME);
}

function draw (matrix) {
	var rgb = {};
	if (color == "rainbow") {
		rgb.red = (Math.sin(rainbowtime * RAINBOW_TIME_COEFF + 0) + 1) * 127;
		rgb.green = (Math.sin(rainbowtime * RAINBOW_TIME_COEFF + 2) + 1) * 127;
		rgb.blue = (Math.sin(rainbowtime * RAINBOW_TIME_COEFF + 4) + 1) * 127;
	} else {
		rgb = parseColor(color);
	}


	for (var x = 0; x < globalWidth; x++) {
	for (var y = 0; y < globalHeight; y++) {
		var noise = (simplex.noise3D(x / SIZE_DIVISOR, y / SIZE_DIVISOR,
			time / TIME_DIVISOR) + 1) / 2;
		noise *= noise;

		var pixelrgb = {};
		pixelrgb.red = rgb.red * noise;
		pixelrgb.green = rgb.green * noise;
		pixelrgb.blue = rgb.blue * noise;

		matrix.setPixelGlobal(x, y, pixelrgb);
	}
	}
}

function event (ev) {
	if (ev == "beat") beat = 1;
}

function terminate () {
	clearInterval(interval);
}

module.exports = {
	darknoise : {
		name : "Darknoise (unicolor)",
		settings : {
			decay : [ "normal", "ultrafast", "fast", "slow" ],
			color : "rainbow"
		},
		init : init,
		draw : draw,
		event : event,
		terminate : terminate,
		description : "One-color noise animation. Moves faster on beat."
	}
};
