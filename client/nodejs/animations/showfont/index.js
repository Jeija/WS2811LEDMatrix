var getPixels = require("get-pixels");
var path = require("path");
var FONT_DIR = "../text";
var FONT = "font5x8.png";
var FONT_X = 5;
var FONT_Y = 8;
var fontpixels;
getPixels(path.join(__dirname, FONT_DIR, FONT), function (err, pixels) {
	if (err) console.log(err);
	else fontpixels = pixels;
});

module.exports = function (matrix, text, xoffset, yoffset, rgb) {
	if (!fontpixels) return;
	for (var n in text) {
		var char = text.charCodeAt(n);
		var charOffsetX = (char % 16) * FONT_X;
		var charOffsetY = Math.floor(char / 16) * FONT_Y;
		for (var x = 0; x < FONT_X; x++) {
		for (var y = 0; y < FONT_Y; y++) {
			if(fontpixels.get(charOffsetX + x, charOffsetY + y, 0)) {
				var xmatrix = Math.round(xoffset + n * FONT_X + x);
				var ymatrix = Math.round(yoffset + y);
				matrix.setPixelGlobal(xmatrix, ymatrix, rgb);
			}
		}}
	}
}
