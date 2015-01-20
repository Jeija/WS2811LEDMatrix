var DECAY_SPEED = 1300;

var spawn = require("child_process").spawn;
var parseColor = require("./parsecolor");

var interval, color, arecord, audioIn, vol = 0;

function init (matrix, settings) {
	arecord = spawn("arecord", ["--rate", "16000", "-f", "U8", "-F", "10000", "-"]);
	audioIn = new require("stream").PassThrough();
	arecord.stdout.pipe(audioIn);
	color = parseColor(settings.color);

	// Increase
	audioIn.on("data", function(data) {
		var pcm = 0;
		for (i = 0; i < data.length; i++) pcm += Math.abs(data[i]-128);
		vol += pcm / data.length;
	});

	// Decay
	interval = setInterval(function () {
		if (vol > 255) vol = 255;
		vol -= DECAY_SPEED / (256 - vol);
		if (vol < 0) vol = 0;
	}, 10);
}

function draw (matrix) {
	matrix.fill({
		red : vol / 255 * color.red,
		green : vol / 255 * color.green,
		blue : vol / 255 * color.blue
	});
}

function event (ev) {
}

function terminate () {
	arecord.kill();
	clearInterval(interval);
}

module.exports = {
	soundglow : {
		name : "Sound Glow",
		settings : {
			color : [ "white", "red", "green", "blue" ]
		},
		init : init,
		draw : draw,
		event : event,
		terminate : terminate,
		description : "Glow with volume of sound."
	}
};
