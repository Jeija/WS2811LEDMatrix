var SimplexNoise = require("simplex-noise");
var simplex = new SimplexNoise();

var t, ofs, beat, globalWidth, globalHeight;

function init (matrix, settings) {
	t = 0;
	ofs = 0;
	beat = 0;
	globalWidth = matrix.getWidth();
	globalHeight = matrix.getHeight();
}

function draw (matrix) {
	for (var x = 0; x < globalHeight; x++) {
		for (var y = 0; y < globalWidth; y++) {
			var noise = simplex.noise3D(ofs + x/8, ofs + y/8, t/200) * 127 + 128;
			matrix.setPixelGlobal(x, y, {
				blue : noise,
				red : Math.max(200 - noise, 0),
				green : 255 - noise
			});
		}
	}
}

function event (ev) {
	if (ev == "beat") beat = 1;
}

setInterval(function () {
	t++;
	ofs += beat / 20;
	if (beat > 0.05) beat -= 0.05;
}, 10);

module.exports = {
	sky : {
		name : "Sky Noise",
		settings : {},
		init : init,
		draw : draw,
		event : event
	}
}
