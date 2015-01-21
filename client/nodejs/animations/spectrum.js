var DECAY_PER_FRAME = 0.05;
var NEW_PER_FRAME = 0.8;
var OLD_PER_FRAME = 0.6;

var spawn = require("child_process").spawn;
var parseColor = require("./parsecolor");
var fjs = require("frequencyjs");

var color, arecord, audioIn, spectrum = [], vol = 0;

function init (matrix, settings) {
	arecord = spawn("arecord", ["--rate", "16000", "-f", "U8", "-F", "16000", "-"]);
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
		if (freqArray.length != 256) return;

		spectrum = fjs.Transform.toSpectrum(freqArray, {sampling : 16000, method : "fft"});
	});
}

var lastbars = [];
function drawbar(matrix, x, height, color) {
	if (!lastbars[x]) lastbars[x] = 0;
	if (lastbars[x] < 0) lastbars[x] = 0;
	if (lastbars[x] > 10) lastbars[x] = 10;
	lastbars[x] = lastbars[x] * OLD_PER_FRAME + height * NEW_PER_FRAME;
	lastbars[x] -= DECAY_PER_FRAME;

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

	return amplitude;
}

function draw (matrix) {
	matrix.clear();
	var color = { green : 255 };
	drawbar(matrix, 0, freqSum(spectrum, 10, 70), color);
	drawbar(matrix, 1, freqSum(spectrum, 70, 130), color);
	drawbar(matrix, 2, freqSum(spectrum, 130, 200), color);
	drawbar(matrix, 3, freqSum(spectrum, 200, 280), color);
	drawbar(matrix, 4, freqSum(spectrum, 280, 360), color);
	drawbar(matrix, 5, freqSum(spectrum, 360, 550), color);
	drawbar(matrix, 6, freqSum(spectrum, 550, 700), color);
	drawbar(matrix, 7, freqSum(spectrum, 700, 1000), color);
	drawbar(matrix, 8, freqSum(spectrum, 1000, 1300), color);
	drawbar(matrix, 9, freqSum(spectrum, 1300, 1600), color);
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
