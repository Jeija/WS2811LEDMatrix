var spawn = require("child_process").spawn;
var exec = require("child_process").exec;
var getPixels = require("get-pixels");
var path = require("path");
var fs = require("fs");
var MAX_OPEN_FILES = 400;
var INTERVAL_TIME = 0.01;
var VIDEO_WIDTH = 20;
var VIDEO_HEIGHT = 10;
var XOFFSET = 10;
var YOFFSET = 10;
var AUDIO_FILE = "audio.wav";

var videoReady = false;
var autoFPSReady = false;
var started = false;
var url, frames, fps, starttime, loadingInterval, ffplay;

function init (matrix, settings) {
	videoReady = false;
	autoFPSReady = false;
	started = false;
	frames = [];
	url = settings.url;

	if (fps != "autoaudio") {
		fps = parseFloat(settings.fps);
		if (isNaN(fps)) fps = 1;
	}

	// Check if video directory exists
	if (!fs.existsSync(url) || !fs.lstatSync(url).isDirectory()) {
		console.log("Given url (" + url + ") is invalid!");
		return;
	}

	// Check for conflicting settings
	if (settings.audio == "none" && settings.fps == "autoaudio") {
		console.log("fps: autoaudio is only available if an audio file is provided");
		return;
	}

	// Check if audio exists
	var audioUrl = path.join(url, AUDIO_FILE);
	function checkReadyState() {
		if (videoReady && autoFPSReady && !started) {
			// Start playing video + audio
			started = true;
			starttime = Date.now();

			if (settings.audio == AUDIO_FILE)
				ffplay = spawn("ffplay", [audioUrl, "-nodisp", "-loglevel", "-8"]);
		}
	}

	if (settings.audio == AUDIO_FILE) {
		if (!fs.existsSync(audioUrl)) {
			console.log("Audio file at " + audioUrl + " not found!");
			return;
		}
	}

	// Read all frames, cache video in RAM
	var videofiles = fs.readdirSync(url);

	// If fps == autoaudio, get audio length to calculate FPS
	if (settings.fps == "autoaudio") {
		var cmd = "ffprobe -show_format " + audioUrl + " -loglevel -8"
			+ " | grep duration"
			+ " | sed -n -e 's/^.*=//p'"
		exec(cmd, function (error, stdout, stderr) {
			var duration = parseFloat(stdout);
			fps = (videofiles.length - 1) / duration;
			autoFPSReady = true;
			checkReadyState();
		});
	} else {
		autoFPSReady = true;
		checkReadyState();
	}

	// Get all _actual_ video frames, excluding the audio.wav file that is also supposed to
	// be in the video directory
	var imgfiles = [];
	for (var filenum in videofiles) {
		var file = videofiles[filenum];
		if (file.substr(file.length - 4) != ".wav") imgfiles.push(file);
	}

	// Problem: Opening all files at the same time is prevented by the ulimit
	// Solution: Open only 100 files at a time
	var open_files = 0;
	var i = 0;
	loadingInterval = setInterval(function () {
		for (var j = 0; j <= MAX_OPEN_FILES; j++) {
			open_files++;
			if (open_files > MAX_OPEN_FILES) return;
			if (!imgfiles[i]) return;

			getPixels(path.join(url, imgfiles[i++]), function (err, pixels) {
				open_files--;
				if (err) console.log(err);
				else frames.push(pixels);
				if (i == imgfiles.length) {
					videoReady = true;
					checkReadyState();
				}
			});
		}
	}, 1);
}

function draw (matrix) {
	if (!(videoReady && autoFPSReady)) return;

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
	clearInterval(loadingInterval);
	if (ffplay) ffplay.kill();
}

module.exports = {
	video : {
		name : "Video",
		settings : {
			url : "Path to frames directory",
			fps : "autoaudio",
			audio : [ AUDIO_FILE, "none" ]
		},
		event : event,
		init : init,
		draw : draw,
		terminate : terminate,
		description : "Display video on matrix, must be downscaled to 20x10 pixels png images, \
				use the provided convertvideo.sh script to accomplish that."
	}
};
