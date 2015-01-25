var getPixels = require("get-pixels");
var parseColor = require("./parsecolor");
var path = require("path");
var FONT_DIR = "text";
var FONT = "font5x8.png";
var FONT_X = 5;
var FONT_Y = 8;
var FONT_OFFSET_X = 10;
var FONT_OFFSET_Y = 12;
var INTERVAL_TIME = 0.01;
var IO_SLIDESPEED_INC = 10;
var fontpixels, color, background, totalWidth, totalHeight, beateffect, slidespeed, interval;
var slideOffset, beat = 0, decay = 0, text = "", io_slidespeed = 0;

function init (matrix, settings) {
	slideOffset = 0;
	text = settings.text;
	color = settings.color;
	background = settings.background;
	beateffect = settings.beateffect;

	switch (settings.decay) {
		case "ultrafast":	decay = 0.1;	break;
		case "fast":		decay = 0.05;	break;
		case "normal":		decay = 0.03;	break;
		case "slow":		decay = 0.015;	break;
	}

	switch (settings.slidespeed) {
		case "slow": slidespeed = 8; break;
		case "normal": slidespeed = 18; break;
		case "fast": slidespeed = 30; break;
		case "superfast": slidespeed = 50; break;
	}

	getPixels(path.join(__dirname, FONT_DIR, FONT), function (err, pixels) {
		if (err) console.log(err);
		else fontpixels = pixels;
	});

	totalWidth = matrix.getWidth();
	totalHeight = matrix.getHeight();

	interval = setInterval(function () {
		if (beateffect == "slide")
			slideOffset += INTERVAL_TIME * slidespeed;
		if (beat > decay) beat -= decay;
		else beat = 0;
		slideOffset += io_slidespeed * INTERVAL_TIME;
	}, INTERVAL_TIME * 1000);
}

function draw (matrix) {
	for (var x = 0; x < totalWidth; x++) {
		for (var y = 0; y < totalHeight; y++) {
			var backColor = parseColor(background);
			matrix.setPixelGlobal(x, y, backColor);
		}
	}

	if (!fontpixels) return;
	for (var n in text) {
		var char = text.charCodeAt(n);
		var charOffsetX = (char % 16) * FONT_X;
		var charOffsetY = Math.floor(char / 16) * FONT_Y;
		for (var x = 0; x < FONT_X; x++) {
		for (var y = 0; y < FONT_Y; y++) {
			var fontColor = parseColor(color);
			var backColor = parseColor(background);

			var val = fontpixels.get(charOffsetX + x, charOffsetY + y, 0);
			if (val > 0) {
			if (beateffect == "brightness") {
				fontColor.red = beat * fontColor.red + (1 - beat) * backColor.red;
				fontColor.green = beat * fontColor.green + (1 - beat) * backColor.green;
				fontColor.blue = beat * fontColor.blue + (1 - beat) * backColor.blue;
			}

			var xmatrix = Math.round(FONT_OFFSET_X + n * FONT_X + x - slideOffset);
			var ymatrix = Math.round(FONT_OFFSET_Y + y);
			matrix.setPixelGlobal(xmatrix, ymatrix, fontColor);
			}
		}}
	}
}

function event (ev, key) {
	if (ev == "beat") {
		beat = 1;
		if (beateffect == "slide") slideOffset = 0;
	}

	if (ev == "keypress" && key == "i") io_slidespeed -= IO_SLIDESPEED_INC;
	if (ev == "keypress" && key == "o") io_slidespeed += IO_SLIDESPEED_INC;
}

function terminate () {
	clearInterval(interval);
}

module.exports = {
	text : {
		name : "Text",
		settings : {
			color : [ "white", "black", "red", "green", "blue" ],
			background : [ "black","white", "red", "green", "blue" ],
			beateffect : [ "none", "brightness", "slide" ],
			decay : [ "fast", "ultrafast", "normal", "slow" ],
			slidespeed : [ "normal", "slow", "fast", "superfast" ],
			text : "Test"
		},
		init : init,
		draw : draw,
		event : event,
		terminate : terminate,
		description : "o to advance in the text, i to go backwards"
	}
};
