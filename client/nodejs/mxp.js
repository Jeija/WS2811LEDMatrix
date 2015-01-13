var dgram = require("dgram");
var path = require("path");
var fs = require("fs");

/**
 * Matrix instance initialization
 * ip:		IP address of LED matrix
 * port:	UDP port of LED matrix
 * widh:	Width of LED Matrix in pixels
 * height:	Height of LED Matrix in pxiels
 * lookup_file:	Filename of CSV pixel arrangement table
 */
function Matrix(ip, port, lookup_file) {
	// Load lookup table: Minimal CSV parser
	var lookup_string = fs.readFileSync(path.join(__dirname, lookup_file), "utf8");
	var yelem = lookup_string.split("\n");

	this.lookup = [];
	for (var y = 0; y < yelem.length; y++) {
		if (yelem[y] === "") break;
		var xelem = yelem[y].split(",");
		this.lookup.push([]);

		for (x = 0; x < xelem.length; x++)
			this.lookup[y].push(parseInt(xelem[x]));
	}

	// Store properties
	this.width = this.lookup[0].length;
	this.height = this.lookup.length;
	this.lednum = this.height * this.width;
	this.port = port;
	this.ip = ip;

	// Generate empty framebuffer (front- and backbuffer)
	this.fb = {front : new Array(this.width), back : new Array(this.width)};
	for (var i = 0; i <= this.width; i++) this.fb.back[i] = new Array(this.height);
	for (var j = 0; j <= this.width; j++) this.fb.front[j] = new Array(this.height);
	this.flip();
	
	// Open socket and output framebuffer regularly
	this.socket = dgram.createSocket("udp4");
	setInterval(this.output.bind(this), 10);
}

/**
 * Prototype for writing the framebuffer to the LED matrix by sending a UDP
 * MatrixProtocol data packet, called in a regular interval
 */
Matrix.prototype.output = function () {
	// Generate raw pixeldata buffer from framebuffer
	var pixeldata = new Buffer(this.width * this.height * 3);
	pixeldata.fill();
	for (var x = 0; x < this.width; x++) {
		for (var y = 0; y < this.height; y++) {
			var offset = this.lookup[y][x] * 3;
			pixeldata[offset + 0] = this.fb.front[x][y].red;
			pixeldata[offset + 1] = this.fb.front[x][y].green;
			pixeldata[offset + 2] = this.fb.front[x][y].blue;
		}
	}

	// Generate UDP packet from header + pixeldata buffer
	var packetlen_h = (this.lednum - this.lednum % 0xff) / 0xff;
	var packetlen_l = this.lednum % 0xff;
	var packet_header = new Buffer([0x00, 0x00, 0x00, packetlen_h, packetlen_l]);
	var packet = Buffer.concat([packet_header, pixeldata]);

	// Send UDP packet to Matrix
	if (this.socket)
		this.socket.send(packet, 0, packet.length, this.port, this.ip);
};

/**
 * Set pixel in LED Matrix to given color
 * x:		X-offset for pixel on matrix | If x or y values are larger than the matrix size
 * y:		Y-offset for pixel on matrix | or negative, setPixel returns false, otherwise true
 * color:	An object of {red = <val>, green = <val>, blue = <val>}
 */
Matrix.prototype.setPixel = function (x, y, color) {
	if (this.width <= x || this.height <= y || x < 0 || y < 0) return false;
	this.fb.back[x][y] = color;
	return true;
};

/**
 * Clear backbuffer, set all pixels to black
 */
Matrix.prototype.clear = function () {
	for (var x = 0; x < this.width; x++) {
		for (var y = 0; y < this.width; y++) {
			this.setPixel(x, y, {red : 0, green : 0, blue : 0});
		}
	}
};

/**
 * Set backbuffer as new frontbuffer to render
 */
Matrix.prototype.flip = function () {
	for (var x = 0; x < this.width; x++) {
		for (var y = 0; y < this.width; y++) {
			if (this.fb.back[x][y]) {
				this.fb.front[x][y].red   = this.fb.back[x][y].red   || 0;
				this.fb.front[x][y].green = this.fb.back[x][y].green || 0;
				this.fb.front[x][y].blue  = this.fb.back[x][y].blue  || 0;
			} else {
				this.fb.front[x][y] = {red : 0, green : 0, blue : 0};
			}
		}
	}
};

module.exports = Matrix;
