var color, beat, interval, decay;

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

	switch (settings.decay) {
		case "ultrafast":
			decay = 0.1;
			break;

		case "fast":
			decay = 0.05;
			break;

		case "normal":
			decay = 0.03;
			break;

		case "slow":
			decay = 0.015;
			break;

		default:
			decay = 0.03;
	}

	interval = setInterval(function () {
		if (beat > decay) beat -= decay;
		else beat = 0;
	}, 10);
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

function terminate () {
	clearInterval(interval);
}

module.exports = {
	strobe : {
		name : "Strobo",
		settings : {
			color : [ "white", "red", "green", "blue" ],
			decay : [ "ultrafast", "fast", "normal", "slow" ]
		},
		init : init,
		draw : draw,
		event : event,
		terminate : terminate,
		description : "Glows bright on beat and decays. No special keys."
	}
};
