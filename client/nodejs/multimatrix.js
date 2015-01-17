var mxp = require("./mxp");

/**
 * Create new MultiMatrix object that consists of multiple matrices with a simple interface
 * matrices_definition:	List of matrices in the following form:
 * {
 * 	some_name_1 : {
 * 		ip : String,		--> IP of LED matrix controller board
 * 		port : Number,		--> UDP port of LED matrix controller board
 * 		lookup_file : String,	--> Filename for CSV pixel arrangement table
 * 		xoffset : Number,	--> Global X-offset of LED matrix in matrices arrangement
 * 		yoffset : Number	--> Global Y-offset of LED matrix in matrices arrangement
 * 	},
 * 	some_name_2 : ...
 * }
 */
function MultiMatrix(matrices_definition) {
	this.matrices_definition = matrices_definition;
	this.matrices = {};
	for (var name in matrices_definition) {
		var mtx = matrices_definition[name];
		this.matrices[name] = new mxp(mtx.ip, mtx.port, mtx.lookup_file);
	}

	// Update width and height attributes based on clients
	this.width = null;
	for (var name in this.matrices) {
		var matrixw = this.matrices_definition[name].xoffset + this.matrices[name].getWidth();
		if (this.width === null || matrixw > this.width) this.width = matrixw;
	}

	this.height = null;
	for (var name in this.matrices) {
		var matrixh = this.matrices_definition[name].yoffset + this.matrices[name].getHeight();
		if (this.height === null || matrixh > this.height) this.height = matrixh;
	}
}

/**
 * Set the same pixel on ALL registered LED matrices
 * x:		x offset of pixel to set from (0/0) of each matrix
 * y:		y offset of pixel to set from (0/0) of each matrix
 * color:	An object of {red = <val>, green = <val>, blue = <val>}
 */
MultiMatrix.prototype.setPixelAll = function (x, y, color) {
	for (var name in this.matrices) {
		this.matrices[name].setPixel(x, y, color);
	}
};

/**
 * Set pixel on the one matrix with the given name
 * name:	Name of matrix to set (as registered in new MultiMatrix())
 * x:		x offset of pixel to set from (0/0) of each matrix
 * y:		y offset of pixel to set from (0/0) of each matrix
 * color:	An object of {red = <val>, green = <val>, blue = <val>}
 */
MultiMatrix.prototype.setPixelMatrix = function (name, x, y, color) {
	this.matrices[name].setPixel(x, y, color);
};

/**
 * Set pixel on one of the matrices in the whole matrix arrangement
 * x and y coordinates are from the global origin (0/0), while matrix
 * origins are at (xoffset/yoffset), as registered in new MultiMatrix()
 * x:		Global x coordinate of pixel to set from global (0/0)
 * y:		Global y coordinate of pixel to set from global (0/0)
 * color:	An object of {red = <val>, green = <val>, blue = <val>}
 */
MultiMatrix.prototype.setPixelGlobal = function (x, y, color) {
	for (var name in this.matrices) {
		var mtx_xoffset = this.matrices_definition[name].xoffset;
		var mtx_yoffset = this.matrices_definition[name].yoffset;
		this.matrices[name].setPixel(x - mtx_xoffset, y - mtx_yoffset, color);
	}
};

/**
 * Set backbuffer as new frontbuffer to render on all matrices
 */
MultiMatrix.prototype.flip = function () {
	for (var name in this.matrices) {
		this.matrices[name].flip();
	}
};

/**
 * Fill backbuffer, set all pixels to the given color for all matrices
 * color:	The color to set for all matrices' pixels
 */
MultiMatrix.prototype.fill = function (color) {
	for (var name in this.matrices) {
		this.matrices[name].fill(color);
	}
};

/**
 * Clear backbuffer, set all pixels to black for all matrices
 */
MultiMatrix.prototype.clear = function () {
	for (var name in this.matrices) {
		this.matrices[name].clear();
	}
};

/**
 * Returns mxp.js/Matrix instance by its name
 * name:	Name of LED Matrix as registered with new MultiMatrix()
 */
MultiMatrix.prototype.getMatrix = function (name) {
	return this.matrices[name];
};

/**
 * Returns total width of whole global environment
 */
MultiMatrix.prototype.getWidth = function () {
	return this.width;
};

/**
 * Returns total height of whole global environment
 */
MultiMatrix.prototype.getHeight = function () {
	return this.height;
};

/**
 * Returns combined front framebuffers of all registered matrices
 */
MultiMatrix.prototype.getFrameBuffer = function () {
	var fb = new Array(this.width);
	for (var i = 0; i <= this.width; i++) fb[i] = new Array(this.height);

	for (var name in this.matrices) {
		var xoffset = this.matrices_definition[name].xoffset;
		var yoffset = this.matrices_definition[name].yoffset;
		var matrixfb = this.matrices[name].getFrameBuffer();
		for (var x = 0; x < matrixfb.length; x++) {
			for (var y = 0; y < matrixfb[x].length; y++) {
				fb[x+xoffset][y+yoffset] = matrixfb[x][y];
			}
		}
	}

	return fb;
};

module.exports = MultiMatrix;
