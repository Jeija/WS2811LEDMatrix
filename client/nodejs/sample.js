var multimatrix = require("./multimatrix");

var matrix = new multimatrix({
	left : {
		ip : "192.168.0.91",
		port : 2711,
		lookup_file : "lookup.csv",
		xoffset : 0,
		yoffset : 0
	},
	right : {
		ip : "192.168.0.80",
		port : 2711,
		lookup_file : "lookup.csv",
		xoffset : 10,
		yoffset : 10
	}
});

// Generate sample framebuffer
var x = 0, y = 5;
var t = 0;
setInterval(function () {
	if (x >= 10) {
		x = 0;
		y++;
		if (y >= 15) y = 5;
	}

	matrix.setPixelGlobal(x + 5, y, {blue : (Math.sin(t / 100) + 1) * 127,
		red : (Math.cos(t / 100) + 1) * 127});
	matrix.flip();

	t++;
	x++;
}, 10);
