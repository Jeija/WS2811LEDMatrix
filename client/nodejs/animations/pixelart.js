var parseColor = require("./parsecolor");
var getPixels = require("get-pixels");
var path = require("path");
var fs = require("fs");

var IMAGES_DIR = "pixelart";
var matrices = ["left", "right", "topLeft", "topRight"];
var images = [];
var currentImg = {};
var change, decay, transition, transitionColor, interval, beat, decay;

function init (matrix, settings) {
	// Parse settings
	change = settings.change;
	transition = settings.transition;
	transitionColor = settings.transitionColor;
	switch (settings.transitionDecay) {
		case "ultrafast":	decay = 0.1;	break;
		case "fast":		decay = 0.05;	break;
		case "normal":		decay = 0.03;	break;
		case "slow":		decay = 0.015;	break;
		default:		decay = 0.03;
	}

	// Read image files from pixelart directory
	var imgfiles = fs.readdirSync(path.join(__dirname, IMAGES_DIR));
	for (var i in imgfiles) {
		console.log("Loading " + imgfiles[i]);
		getPixels(path.join(__dirname, IMAGES_DIR, imgfiles[i]), function (err, pixels) {
			if (err) console.log(err);
			else images.push(pixels);
		});
	}

	interval = setInterval(function () {
		if (beat > decay) beat -= decay;
		else beat = 0;
	}, 10);
}

function draw (matrix) {
	matrix.clear();
	var trCol = transition == "glow" ? parseColor(transitionColor) :
		{ red : 0, green : 0, blue : 0 };
	trCol.red *= beat;
	trCol.green *= beat;
	trCol.blue *= beat;

	for (var mtx in matrices) {
		var img = currentImg[matrices[mtx]];
		if (img === undefined || !images[img]) continue;
		for (var x = 0; x < 10; x++) {
			for (var y = 0; y < 10; y++) {
				var col = {
					red : Math.min(255, images[img].get(x, y, 0) + trCol.red),
					green : Math.min(255, images[img].get(x, y, 1) + trCol.green),
					blue : Math.min(255, images[img].get(x, y, 2) + trCol.blue)
				};
				matrix.setPixelMatrix(matrices[mtx], x, y, col);
			}
		}
	}
}

function newImgId(oldid) {
	var newImg = null;
	while (newImg === null || newImg === oldid)
		newImg = Math.floor(Math.random() * images.length);
	return newImg;
}

function event (ev) {
	// Assign random new image to every matrix on beat
	if (ev == "beat") {
		beat = 1;
		if (change == "everything") {
			for (var i in matrices) {
				currentImg[matrices[i]] = newImgId(currentImg[matrices[i]]);
			}
		} else if (change == "one") {
			var j = Math.round(Math.random() * 4);
			currentImg[matrices[j]] = newImgId(currentImg[matrices[j]]);
		}
	}
}

function terminate () {
	images = [];
	clearInterval(interval);
}

module.exports = {
	pixelart : {
		name : "Pixel Art",
		init : init,
		settings : {
			change : [ "everything", "one" ],
			transition : [ "none", "glow" ],
			transitionColor : [ "white", "red", "green", "blue" ],
			transitionDecay : [ "fast", "ultrafast", "normal", "slow" ]
		},
		draw : draw,
		event : event,
		terminate : terminate,
		description : "TODO"
	}
};
