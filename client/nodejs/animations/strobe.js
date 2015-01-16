var color;
var beat;

function init (matrix, settings) {
	switch (settings.color) {
		case "white":
			color = { red : 255, green : 255, blue : 255 };
			break;

		case "red":
			color = { red : 255 };
			break;

		case "green":
			color = { green : 255 };
			break;

		case "blue":
			color = { blue : 255 };
			break;

		default:
			color = { red : 0, green : 0, blue : 0 };
	}
}

function draw (matrix) {
	matrix.fill({
		red : beat * color.red,
		green : beat * color.green,
		blue : beat * color.blue
	});
}

function event (ev) {
	if (ev == "beat") beat = 1;
}

setInterval(function () {
	if (beat > 0.02) beat -= 0.02;
	else beat = 0;
}, 10);

module.exports = {
	strobe : {
		name : "Strobo",
		settings : {
			color : [ "white", "red", "green", "blue" ]
		},
		init : init,
		draw : draw,
		event : event
	}
}
