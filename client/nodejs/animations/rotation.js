var parseColor = require("./parsecolor");
var totalWidth, totalHeight, axis, interval, rays, spreadAngle, speed, cmpAngle = 0, color;
var INTERVAL_TIME = 0.01;

function init (matrix, settings) {
	totalWidth = matrix.getWidth();
	totalHeight = matrix.getHeight();
	color = settings.color;

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

	setInterval(function () {
		cmpAngle += INTERVAL_TIME * Math.PI * speed;
		if (cmpAngle > 2 * Math.PI) cmpAngle -= 2 * Math.PI;
	}, INTERVAL_TIME * 1000);
}

function pixelOnRay(x, y) {
	var angle = Math.atan2(x - axis.x, -y + axis.y) + Math.PI;

	for (var ray = 0; ray < rays; ray++) {
		var offsetAngle = 2 * Math.PI / rays * ray;

		if ((angle < cmpAngle + offsetAngle + spreadAngle && angle > cmpAngle + offsetAngle)
			|| (angle < cmpAngle - 2 * Math.PI + offsetAngle + spreadAngle
				&& angle > cmpAngle - 2 * Math.PI + offsetAngle))
		{
			return true;
		}
	}
}

function draw (matrix) {
	matrix.clear();

	var rgb = parseColor(color);
	for (var x = 0; x < totalWidth; x++) {
		for (var y = 0; y < totalHeight; y++) {
			if (pixelOnRay(x, y)) matrix.setPixelGlobal(x, y, rgb);
		}
	}
}

function event (ev) {
}

function terminate () {
	clearInterval(interval);
}

module.exports = {
	rotation : {
		name : "Rotation",
		init : init,
		draw : draw,
		event : event,
		settings : {
			axis : [ "bottomcenter", "center" ],
			rays : [ 4, 1, 2, 3, 5, 6, 7, 8 ],
			spread : [ "10°", "20°", "30°", "40°", "50°", "60°" ],
			speed : [ "normal", "ambient", "slow", "fast", "superfast"],
			color : ["white", "blue", "green", "red"]
		},
		terminate : terminate,
		description : "TODO"
	}
};
