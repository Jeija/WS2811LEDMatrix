var parseColor = require("./parsecolor");
var spawn = require("child_process").spawn;
var fjs = require("frequencyjs");

var INTERVAL_TIME = 0.01;
var DECAY_SPEED = 1;
var SINE_OFFSET_X = 10;
var SINE_OFFSET_Y = 10;
var SINE_WIDTH = 20;
var SINE_HEIGHT = 10;
var spectrum = [], vol = 0, dominantFreq = 0, color;

function init (matrix, settings) {
	arecord = spawn("arecord", ["--rate", "16000", "-f", "U8", "-F", "16000", "-"]);
	audioIn = new require("stream").PassThrough();
	arecord.stdout.pipe(audioIn);
	color = settings.color;

	// Increase
	audioIn.on("data", function(data) {
		var freqArray = [];
		var pcm = 0;
		for (i = 0; i < data.length; i++) {
			pcm += Math.abs(data[i] - 128) / 255;
			freqArray.push(data[i]-128);
		}
		vol += pcm / data.length;
		if (freqArray.length != 256) return;

		spectrum = fjs.Transform.toSpectrum(freqArray, {sampling : 16000, method : "fft"});

		var total_freq = 0, total_amplitude = 0;
		for (var freq in spectrum) {
			if (spectrum[freq].amplitude) {
				var amplitude2 = spectrum[freq].amplitude * spectrum[freq].amplitude;
				total_amplitude += amplitude2 * amplitude2;
				total_freq += spectrum[freq].frequency * amplitude2 * amplitude2;
			}
		}
		if (total_amplitude > 0)
			dominantFreq = dominantFreq * 0.9 + total_freq / total_amplitude * 0.1;
	});

	// Decay
	interval = setInterval(function () {
		if (vol > 1) vol = 1;
		vol -= INTERVAL_TIME * DECAY_SPEED / (1 - vol);
		if (vol < 0) vol = 0;
	}, INTERVAL_TIME * 1000);
}

function draw (matrix) {
	var yoffset = SINE_HEIGHT / 2 + SINE_OFFSET_Y;
	matrix.clear();
	for (var x = SINE_OFFSET_X; x < SINE_OFFSET_X + SINE_WIDTH; x++) {
		var sinx = x - SINE_OFFSET_X - SINE_WIDTH / 2;

		var y = (Math.sin(sinx * dominantFreq * 0.002) * vol * SINE_HEIGHT / 2) + yoffset;
		matrix.setPixelGlobal(Math.round(x), Math.round(y), parseColor(color));
	}
}

function event (ev) {
}

function terminate () {
	arecord.kill();
	clearInterval(interval);
}

module.exports = {
	sine : {
		name : "Sine",
		settings : {
			color : [ "white", "red", "green", "blue" ]
		},
		init : init,
		draw : draw,
		event : event,
		terminate : terminate,
		description : "Sine."
	}
};
