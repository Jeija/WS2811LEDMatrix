var SimplexNoise = require("simplex-noise");
var simplex = new SimplexNoise();
var INTERVAL_TIME = 0.01;
var SIZE_DIVISOR = 30;
var TIME_DIVISOR = 100;
var BEAT_TIME_COEFF = 0.6;

var time, beat, globalWidth, globalHeight, interval, decay;

function init (matrix, settings) {
	time = 0;
	beat = 0;

	globalWidth = matrix.getWidth();
	globalHeight = matrix.getHeight();

	switch (settings.decay) {
		case "ultrafast": decay = 0.025; break;
		case "fast": decay = 0.015; break;
		case "normal": decay = 0.0075; break;
		case "slow": decay = 0.0025; break;
	}

	interval = setInterval(function () {
		time += INTERVAL_TIME;
		time += beat * BEAT_TIME_COEFF;
		if (beat > decay) beat -= decay;
		else beat = 0;
	}, INTERVAL_TIME);
}

function draw (matrix) {
	for (var x = 0; x < globalWidth; x++) {
	for (var y = 0; y < globalHeight; y++) {
		var noise = (simplex.noise3D(x / SIZE_DIVISOR, y / SIZE_DIVISOR,
			time / TIME_DIVISOR) + 1) * 3;

		var rgb = {
			red : (Math.sin(noise - 0) + 1) * 127,
			green : (Math.sin(noise - 2) + 1) * 127,
			blue : (Math.sin(noise - 4) + 1) * 127
		};

		matrix.setPixelGlobal(x, y, rgb);
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
	heatnoise : {
		name : "Heat Noise",
		settings : {
			decay : [ "normal", "ultrafast", "fast", "slow" ]
		},
		init : init,
		draw : draw,
		event : event,
		terminate : terminate,
		description : "Colorful noise function. Moves faster on beat."
	}
};
