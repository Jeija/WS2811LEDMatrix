var DECAY_PER_FRAME = 0.05;
var NEW_PER_FRAME = 0.8;
var OLD_PER_FRAME = 0.6;

var spawn = require("child_process").spawn;
var parseColor = require("./parsecolor");
var fjs = require("frequencyjs");

var color, interval, arecord, audioIn, spectrum = [], vol = 0, time = 0;

function init (matrix, settings) {
	arecord = spawn("arecord", ["--rate", "16000", "-f", "U8", "-F", "16000", "-"]);
	audioIn = new require("stream").PassThrough();
	arecord.stdout.pipe(audioIn);
	color = settings.color;

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

	interval = setInterval(function () {
		time += 0.1;
	}, 100);
}

var lastbars = [];
function drawbar(matrix, x, height, color) {
	if (!lastbars[x]) lastbars[x] = 0;
	if (lastbars[x] < 0) lastbars[x] = 0;
	if (lastbars[x] > 10) lastbars[x] = 10;
	lastbars[x] = lastbars[x] * OLD_PER_FRAME + height * NEW_PER_FRAME;
	lastbars[x] -= DECAY_PER_FRAME;

	// Determine bar color
	var rgb;
	if (color == "intensity1")
		rgb = { red : lastbars[x] * 25.5, green : 255 - lastbars[x] * 25.5 };
	else if (color == "intensity1_blue")
		rgb = { red : lastbars[x] * 25.5, blue : 255 - lastbars[x] * 25.5 };
	else if (color == "intensity1_cyan")
		rgb = { red : lastbars[x] * 25.5, blue : 255 - lastbars[x] * 25.5,
			green : 255 - lastbars[x] * 25.5 };
	else if (color == "rainbowdash")
	{
		if (Math.round(x + time * 5) % 6 == 0) rgb = { red : 238, green :  20, blue :  20 };
		if (Math.round(x + time * 5) % 6 == 1) rgb = { red : 250, green : 150, blue :  20 };
		if (Math.round(x + time * 5) % 6 == 2) rgb = { red : 253, green : 246, blue : 100 };
		if (Math.round(x + time * 5) % 6 == 3) rgb = { red :  50, green : 210, blue :  50 };
		if (Math.round(x + time * 5) % 6 == 4) rgb = { red :  30, green : 152, blue : 211 };
		if (Math.round(x + time * 5) % 6 == 5) rgb = { red : 110, green :  20, blue : 130 };
	}
	else if (color != "intensity2" && color != "intensity2_blue" && color != "intensity3")
		rgb = parseColor(color);

	for (var y = 0; y < lastbars[x] - 1; y++) {
		if (color == "intensity2")
			rgb = { red : y * 25.5, green : 255 - y * 25.5 };
		else if (color == "intensity2_blue")
			rgb = { red : y * 25.5, blue : 255 - y * 25.5 };
		else if (color == "intensity3")
			rgb = { red : y > 3 ? 255 : 0, green : y < 7 ? 255 : 0 };
		matrix.setPixelAll(x, 9 - y, rgb);
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

	// Draw background color (if any)
	if (color == "rainbowdash") {
		matrix.fill({ red : 80, green :  80, blue : 180 });
	}
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

function event (ev, data) {
}

function terminate () {
	clearInterval(interval);
	arecord.kill();
}

module.exports = {
	spectrum : {
		name : "Spectrum",
		init : init,
		draw : draw,
		event : event,
		settings : {
			color : ["white", "red", "green", "blue", "intensity1", "intensity1_blue",
				"intensity1_cyan", "intensity2", "intensity2_blue", "intensity3",
				"rainbowdash"]
		},
		terminate : terminate,
		description : "Audio spectrum"
	}
};
