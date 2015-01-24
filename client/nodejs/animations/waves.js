var parseColor = require("./parsecolor");
var INTERVAL_TIME = 0.01;	// seconds

var epicenter, time = 0, totalWidth, totalHeight, wavelength, wavespeed, color;

function init (matrix, settings) {
	totalWidth = matrix.getWidth();
	totalHeight = matrix.getHeight();
	color = settings.color;

	switch (settings.epicenter) {
		case "center": epicenter = { x : totalWidth / 2, y : totalHeight / 2 }; break;
		case "bottomcenter":
			epicenter = { x : totalWidth / 2, y : totalHeight * (3 / 4) };
			break;
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

	interval = setInterval(function () {
		time = time + INTERVAL_TIME;
	}, INTERVAL_TIME * 1000);
}

function draw (matrix) {
	matrix.clear();
	for (var x = 0; x <= totalWidth; x++) {
		for (var y = 0; y <= totalHeight; y++) {
			var dx2 = (x - epicenter.x) * (x - epicenter.x);
			var dy2 = (y - epicenter.y) * (y - epicenter.y);
			var intensity = (Math.sin(Math.sqrt(dx2 + dy2) / wavelength * (2 * Math.PI)
				- time * wavespeed) + 1);
			var col = parseColor(color);
			col.red *= intensity / 2;
			col.green *= intensity / 2;
			col.blue *= intensity / 2;
			matrix.setPixelGlobal(x, y, col);
		}
	}
}

function event (ev) {
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
			color : [ "white", "red", "green", "blue" ]
		},
		init : init,
		draw : draw,
		event : event,
		terminate : terminate,
		description : "TODO"
	}
};
