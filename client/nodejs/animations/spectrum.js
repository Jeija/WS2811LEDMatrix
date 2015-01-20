var DECAY_SPEED = 1300;

var spawn = require("child_process").spawn;
var parseColor = require("./parsecolor");
var fjs = require("frequencyjs");

var color, arecord, audioIn, spectrum = [], vol = 0;

function init (matrix, settings) {
	arecord = spawn("arecord", ["--rate", "16000", "-f", "U8", "-F", "32000", "-"]);
	audioIn = new require("stream").PassThrough();
	arecord.stdout.pipe(audioIn);
	color = parseColor(settings.color);

	audioIn.on("data", function(data) {
		var freqArray = [];
		var vol = 0;
		for (i = 0; i < data.length; i++) {
			vol += Math.abs(data[i]-128);
			freqArray.push(data[i]-128);
		}
		vol = vol / data.length;
		if (freqArray.length != 512) return;

		spectrum = fjs.Transform.toSpectrum(freqArray, {sampling : 16000, method : "fft"});
	});
}

var lastbars = [];
function drawbar(matrix, x, height, color) {
	if (lastbars[x]) lastbars[x] = lastbars[x] * 0.9 + height * 0.1;
	else lastbars[x] = height;
	for (var y = 0; y < lastbars[x] - 1; y++) {
		matrix.setPixelAll(x, 9 - y, color);
	}
}

function freqSum(spectrum, lowerLimit, upperLimit) {
	var nFreq = 0;
	var amplitude = 0;
	for (var i in spectrum) {
		if (spectrum[i].frequency > lowerLimit && spectrum[i].frequency < upperLimit) {
			nFreq++;
			amplitude += spectrum[i].amplitude;
		}
	}
	return amplitude / nFreq;
}

function draw (matrix) {
	matrix.clear();
	var color = { green : 255 };
	drawbar(matrix, 0,   1 * freqSum(spectrum, 20, 40), color);
	drawbar(matrix, 1,   2 * freqSum(spectrum, 40, 80), color);
	drawbar(matrix, 2,   3 * freqSum(spectrum, 80, 160), color);
	drawbar(matrix, 3,   4 * freqSum(spectrum, 160, 320), color);
	drawbar(matrix, 4,   5 * freqSum(spectrum, 320, 640), color);
	drawbar(matrix, 5,   6 * freqSum(spectrum, 640, 1280), color);
	drawbar(matrix, 6,   7 * freqSum(spectrum, 1280, 1560), color);
	drawbar(matrix, 7,   8 * freqSum(spectrum, 1560, 3020), color);
	drawbar(matrix, 8,   9 * freqSum(spectrum, 3020, 6040), color);
	drawbar(matrix, 9,  10 * freqSum(spectrum, 6040, 12080), color);
}

function event (ev) {
}

function terminate () {
	arecord.kill();
}

module.exports = {
	spectrum : {
		name : "Spectrum",
		init : init,
		draw : draw,
		event : event,
		terminate : terminate,
		description : "Audio spectrum"
	}
};
