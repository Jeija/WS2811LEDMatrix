var parseColor = require("./parsecolor");
var totalWidth, totalHeight, axis, interval, rays, spreadAngle, speed, cmpAngle = 0, color, spirality;
var transition;
var INTERVAL_TIME = 0.01;

function init (matrix, settings) {
	totalWidth = matrix.getWidth();
	totalHeight = matrix.getHeight();
	color = settings.color;
	transition = settings.transition;

	switch (settings.axis) {
		case "center":
			axis = { x : totalWidth / 2 - 0.5, y : totalHeight / 2  - 0.5 };
			break;

		case "bottomcenter":
			axis = { x : totalWidth / 2  - 0.5, y : totalHeight * (3/4)  - 0.5 };
			break;
	}

	rays = settings.rays;
	switch (settings.spread) {
		case "10°": spreadAngle = Math.PI / 18; break;
		case "20°": spreadAngle = Math.PI / 9; break;
		case "30°": spreadAngle = Math.PI / 6; break;
		case "40°": spreadAngle = Math.PI / 4.5; break;
		case "50°": spreadAngle = Math.PI / 3.6; break;
		case "60°": spreadAngle = Math.PI / 3; break;
	}

	switch (settings.speed) {
		case "ambient": speed = 0.05; break;
		case "slow": speed = 0.1; break;
		case "normal": speed = 0.2; break;
		case "fast": speed =  0.4; break;
		case "superfast": speed =  1.0; break;
	}

	switch (settings.spirality) {
		case "none": spirality = 0; break;
		case "smaller": spirality = 0.01; break;
		case "small": spirality = 0.02; break;
		case "normal": spirality = 0.05; break;
		case "high": spirality = 0.1; break;
		case "higher": spirality = 0.2; break;
		case "highest": spirality = 0.4; break;
	}


 
	setInterval(function () {
		cmpAngle += INTERVAL_TIME * Math.PI * speed;
		if (cmpAngle > 2 * Math.PI) cmpAngle -= 2 * Math.PI;
	}, INTERVAL_TIME * 1000);
}

// Get angle difference between closes ray and pixel
function pixelRayDeltaAngle(x, y) {
	var deltas = [];
	var angle = Math.atan2(x - axis.x, -y + axis.y) + Math.PI;
	var dx2 = (x - axis.x) * (x - axis.x);
	var dy2 = (axis.y - y) * (axis.y - y);
	var distance = Math.sqrt(dx2 + dy2);
	var spiralOffset = spirality * distance;

	for (var ray = 0; ray < rays; ray++) {
		var offsetAngle = 2 * Math.PI / rays * ray;

		// Look 3 rounds back and ahead
		for (var i = -3; i < 3; i++) {
			var roundAngle = i * 2 * Math.PI;
			deltas.push(Math.abs(angle - cmpAngle - offsetAngle - spreadAngle
				+ spiralOffset - roundAngle));
		}
	}

	// Find the ray with the smallest delta angle
	var mindelta = null;
	for (var d in deltas) {
		if (mindelta === null || deltas[d] < mindelta) mindelta = deltas[d];
	}
	return mindelta;
}

function draw (matrix) {
	matrix.clear();

	var rgb = parseColor(color);
	for (var x = 0; x < totalWidth; x++) {
		for (var y = 0; y < totalHeight; y++) {
			if (transition == "none") {
				if (pixelRayDeltaAngle(x, y) < spreadAngle / 2)
					matrix.setPixelGlobal(x, y, rgb);
			} else if (transition == "smooth") {
				var delta = pixelRayDeltaAngle(x, y);
				var intensity = Math.max(1 - delta / spreadAngle * 2, 0);
				var pixelcolor = {
					red : Math.round(rgb.red * intensity),
					green : Math.round(rgb.green * intensity),
					blue : Math.round(rgb.blue * intensity),
				};
				matrix.setPixelGlobal(x, y, pixelcolor);
			}
		}
	}
}

function event (ev) {
}

function terminate () {
	clearInterval(interval);
}

module.exports = {
	spiral : {
		name : "Rotation / Spiral",
		init : init,
		draw : draw,
		event : event,
		settings : {
			axis : [ "bottomcenter", "center" ],
			rays : [ 4, 1, 2, 3, 5, 6, 7, 8 ],
			spread : [ "30°", "10°", "20°", "40°", "50°", "60°" ],
			speed : [ "normal", "ambient", "slow", "fast", "superfast"],
			color : ["white", "blue", "green", "red"],
			spirality : [ "none", "smaller", "small", "normal", "high", "higher",
				"highest" ],
			transition : [ "none", "smooth" ]
		},
		terminate : terminate,
		description : "TODO"
	}
};
