var getPixels = require("get-pixels");
var path = require("path");
var fs = require("fs");

var IMAGES_DIR = "pixelart";
var matrices = ["left", "right", "topLeft", "topRight"];
var images = [];
var currentImg = {};
var change;

function init (matrix, settings) {
	change = settings.change;
	var imgfiles = fs.readdirSync(path.join(__dirname, IMAGES_DIR));
	for (var i in imgfiles) {
		console.log("Loading " + imgfiles[i]);
		getPixels(path.join(__dirname, IMAGES_DIR, imgfiles[i]), function (err, pixels) {
			if (err) console.log(err);
			else images.push(pixels);
		});
	}
}

function draw (matrix) {
	matrix.clear();
	for (var mtx in matrices) {
		var img = currentImg[matrices[mtx]];
		if (img === undefined || !images[img]) continue;
		for (var x = 0; x < 10; x++) {
			for (var y = 0; y < 10; y++) {
				var col = {
					red : images[img].get(x, y, 0),
					green : images[img].get(x, y, 1),
					blue : images[img].get(x, y, 2)
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
		if (change == "everything") {
			for (var i in matrices) {
				currentImg[matrices[i]] = newImgId(currentImg[matrices[i]]);
			}
		} else if (change == "one") {
			var i = Math.round(Math.random() * 4);
			currentImg[matrices[i]] = newImgId(currentImg[matrices[i]]);
		}
	}
}

function terminate () {
	images = [];
}

module.exports = {
	pixelart : {
		name : "Pixel Art",
		init : init,
		settings : {
			change : [ "everything", "one" ]
		},
		draw : draw,
		event : event,
		terminate : terminate,
		description : "TODO"
	}
};
