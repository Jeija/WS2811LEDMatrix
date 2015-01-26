var parseColor = require("./parsecolor");
var INTERVAL_TIME = 0.01;
var BEATEFFECT_TIME_SPEED = 0.2;
var color, beat = 0, decay, interval, beateffect, totalWidth, totalHeight, time;

function init (matrix, settings) {
	color = settings.color;
	time = 0;
	beateffect = settings.beateffect;
	totalWidth = matrix.getWidth();
	totalHeight = matrix.getHeight();

	switch (settings.decay) {
		case "ultrafast": decay = 0.1; break;
		case "fast": decay = 0.05; break;
		case "normal": decay = 0.03; break;
		case "slow": decay = 0.015; break;
	}

	interval = setInterval(function () {
		if (beat > decay) beat -= decay;
		else beat = 0;
		time += INTERVAL_TIME;
		if (beateffect == "time") time += beat * BEATEFFECT_TIME_SPEED;
	}, INTERVAL_TIME * 1000);
}

function draw (matrix) {
	matrix.clear();
	var rgb = {};
	if (color == "rainbow") {
		rgb.red = (Math.sin(time + 0) + 1) * 127;
		rgb.green = (Math.sin(time + 2) + 1) * 127;
		rgb.blue = (Math.sin(time + 4) + 1) * 127;
	} else {
		rgb = parseColor(color);
	}

	if (beateffect == "bar") {
		for (var x = 0; x < totalWidth; x++) {
			for (var y = 0; y < totalHeight; y++) {
				if (y > totalHeight - beat * totalHeight) {
					matrix.setPixelGlobal(x, y, rgb);
				}
			}
		}
	} else {
		matrix.fill(rgb);
	}
}

function event (ev, key) {
	if (ev == "beat") beat = 1;
	if (ev == "keypress" && key == "r") {
		var red = Math.round(Math.random() * 255);
		var green = Math.round(Math.random() * 255);
		var blue = Math.round(Math.random() * 255);
		color = "#" + red.toString(16) + green.toString(16) + blue.toString(16);
	}
}

function terminate () {
	clearInterval(interval);
}

module.exports = {
	color : {
		name : "Color",
		settings : {
			color : "rainbow",
			decay : [ "ultrafast", "fast", "normal", "slow" ],
			beateffect : [ "none", "bar", "time" ]
		},
		init : init,
		draw : draw,
		event : event,
		terminate : terminate,
		description : "Press r for random new color."
	}
};
