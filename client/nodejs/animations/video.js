var getPixels = require("get-pixels");
var path = require("path");
var fs = require("fs");
var MAX_OPEN_FILES = 400;
var INTERVAL_TIME = 0.01;
var VIDEO_WIDTH = 20;
var VIDEO_HEIGHT = 10;
var XOFFSET = 10;
var YOFFSET = 10;

var ready = false;
var url, frames, fps, starttime;

function init (matrix, settings) {
	frames = [];
	url = settings.url;
	fps = parseFloat(settings.fps);
	ready = false;
	if (isNaN(fps)) fps = 1;

	// Check if video directory exists
	if (!fs.existsSync(url) || !fs.lstatSync(url).isDirectory()) {
		console.log("Given url (" + url + ") is invalid!");
		return;
	}

	// Read all frames, cache video in RAM
	var imgfiles = fs.readdirSync(url);

	// Problem: Opening all files at the same time is prevented by the ulimit
	// Solution: Open only 100 files at a time
	var open_files = 0;

	var i = 0;
	setInterval(function () {
		for (var j = 0; j <= MAX_OPEN_FILES; j++) {
			open_files++;
			if (open_files > MAX_OPEN_FILES) return;
			if (!imgfiles[i]) return;
			getPixels(path.join(url, imgfiles[i++]), function (err, pixels) {
				open_files--;
				if (err) console.log(err);
				else frames.push(pixels);
				if (i == imgfiles.length) {
					starttime = Date.now();
					ready = true;
				}
			});
		}
	}, 1);
}

function draw (matrix) {
	if (!ready) return;

	var time_seconds = (Date.now() - starttime) / 1000;
	var framenum = Math.round(time_seconds * fps);
	if (!frames[framenum]) return;
	var frame = frames[framenum];

	for (var x = 0; x < VIDEO_WIDTH; x++) {
		for (var y = 0; y < VIDEO_HEIGHT; y++) {
			var rgb = {
				red : frame.get(x, y, 0),
				green : frame.get(x, y, 1),
				blue : frame.get(x, y, 2)
			}

			// Simple gamma correction:
			rgb.red = 255 * Math.pow(rgb.red/255, 1/0.45);
			rgb.green = 255 * Math.pow(rgb.green/255, 1/0.45);
			rgb.blue = 255 * Math.pow(rgb.blue/255, 1/0.45);

			matrix.setPixelGlobal(x + XOFFSET, y + YOFFSET, rgb);
		}
	}
}

function event (ev) {
}

function terminate () {
}

module.exports = {
	video : {
		name : "Video",
		settings : {
			url : "Path to frames directory",
			fps : "30"
		},
		event : event,
		init : init,
		draw : draw,
		terminate : terminate,
		description : "Display video on matrix, must be downscaled to 20x10 pixels png images, \
				e.g. ffmpeg -i <input> -vf scale=20:10 <outdir>/%05d.png"
	}
};
