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
			time / TIME_DIVISOR) + 1) / 2;

		var rgb;
		if (noise > 0/6 && noise < 1/6) rgb = { red : 238, green :  20, blue :  20 };
		if (noise > 1/6 && noise < 2/6) rgb = { red : 250, green : 150, blue :  20 };
		if (noise > 2/6 && noise < 3/6) rgb = { red : 253, green : 246, blue : 100 };
		if (noise > 3/6 && noise < 4/6) rgb = { red :  50, green : 210, blue :  50 };
		if (noise > 4/6 && noise < 5/6) rgb = { red :  30, green : 152, blue : 211 };
		if (noise > 5/6 && noise < 6/6) rgb = { red : 110, green :  20, blue : 130 };

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
	rainbowdash : {
		name : "Rainbow Dash Noise",
		settings : {
			decay : [ "normal", "ultrafast", "fast", "slow" ]
		},
		init : init,
		draw : draw,
		event : event,
		terminate : terminate,
		description : "Noise in rainbow dash colors. Moves faster on beat."
	}
};
