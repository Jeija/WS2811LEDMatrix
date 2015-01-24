var parseColor = require("./parsecolor");
var INTERVAL_TIME = 0.01;	// seconds

var epicenter, time = 0, totalWidth, totalHeight, wavelength, wavespeed, color, colorspeed, beateffect, decay, beat = 0;

function init (matrix, settings) {
	totalWidth = matrix.getWidth();
	totalHeight = matrix.getHeight();
	color = settings.color;
	beateffect = settings.beateffect;

	switch (settings.epicenter) {
		case "center": epicenter = { x : totalWidth / 2, y : totalHeight / 2 }; break;
		case "bottomcenter":
			epicenter = { x : totalWidth / 2, y : totalHeight * (3 / 4) };
			break;
	}

	switch (settings.decay) {
		case "ultrafast":	decay = 0.1;	break;
		case "fast":		decay = 0.05;	break;
		case "normal":		decay = 0.03;	break;
		case "slow":		decay = 0.015;	break;
		default:		decay = 0.03;
	}

	switch (settings.wavelength) {
		case "long": wavelength = 8; break;
		case "normal": wavelength = 5; break;
		case "short": wavelength = 3; break;
	}

	switch (settings.wavespeed) {
		case "slow": wavespeed = 5; break;
		case "normal": wavespeed = 10; break;
		case "fast": wavespeed = 15; break;
		case "superfast": wavespeed = 25; break;
		case "ultrafast": wavespeed = 35; break;
	}

	switch (settings.colorspeed) {
		case "ultraslow": colorspeed = 0.1; break;
		case "slow": colorspeed = 0.3; break;
		case "normal": colorspeed = 0.5; break;
		case "fast": colorspeed = 1; break;
	}

	interval = setInterval(function () {
		time += INTERVAL_TIME;
		if (beateffect == "time") {
			time += beat * 0.05;
		}
		if (beat > decay) beat -= decay;
		else beat = 0;
	}, INTERVAL_TIME * 1000);
}

function draw (matrix) {
	matrix.clear();
	for (var x = 0; x <= totalWidth; x++) {
		for (var y = 0; y <= totalHeight; y++) {
			var dx2 = (x - epicenter.x) * (x - epicenter.x);
			var dy2 = (y - epicenter.y) * (y - epicenter.y);
			var wlenOffset = 0;
			if (beateffect == "wavelength") {
				wlenOffset = -beat * 5;
			}
			var intensity = (Math.sin(Math.sqrt(dx2 + dy2) / (wavelength + wlenOffset)
				* (2 * Math.PI) - time * wavespeed) + 1);

			var rgb;
			var distance = Math.sqrt(dx2 + dy2);
			if (color == "rainbowtime") {
				rgb = {
					red : (Math.sin(distance + 0) + 1) * 127,
					green : (Math.sin(distance + 2) + 1) * 127,
					blue : (Math.sin(distance + 4) + 1) * 127
				};
			} else if (color == "rainbow") {
				rgb = {
					red : (Math.sin(colorspeed *
						(distance - time * wavespeed) + 0)  + 1) * 127,
					green : (Math.sin(colorspeed *
						(distance - time * wavespeed) + 2) + 1) * 127,
					blue : (Math.sin(colorspeed *
						(distance - time * wavespeed) + 4) + 1) * 127
				};
			} else {
				rgb = parseColor(color);
			}
			rgb.red *= intensity / 2;
			rgb.green *= intensity / 2;
			rgb.blue *= intensity / 2;
			if (beateffect == "brightness") {
				rgb.red *= beat;
				rgb.green *= beat;
				rgb.blue *= beat;
			}
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
	waves : {
		name : "Waves",
		settings : {
			epicenter : [ "bottomcenter", "center" ],
			wavelength : [ "long", "normal", "short" ],
			wavespeed : [ "fast", "slow", "normal", "superfast", "ultrafast" ],
			color : [ "white", "red", "green", "blue", "rainbowtime", "rainbow" ],
			colorspeed : [ "ultraslow", "slow", "normal", "fast" ],
			beateffect : [ "none", "brightness", "wavelength", "time" ],
			decay : [ "fast", "ultrafast", "normal", "slow" ]
		},
		init : init,
		draw : draw,
		event : event,
		terminate : terminate,
		description : "TODO"
	}
};
