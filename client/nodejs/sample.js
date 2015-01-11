var mxp = require("./mxp");

var matrix = new mxp("192.168.0.91", 2711, "lookup.csv");

// Generate sample framebuffer
var x = 0, y = 0;
var t = 0;
setInterval(function () {
	if (x >= 10) {
		x = 0;
		y++;
		if (y >= 10) y = 0;
	}

	matrix.setPixel(x, y, {blue : (Math.sin(t / 100) + 1) * 127,
				red : (Math.cos(t / 100) + 1) * 127});
	matrix.flip();

	t++;
	x++;
}, 10);
