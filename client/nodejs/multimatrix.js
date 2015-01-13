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
 * Clear backbuffer, set all pixels to black for all matrices
 */
MultiMatrix.prototype.clear = function () {
	for (var name in this.matrices) {
		this.matrices[name].clear();
	}
};

module.exports = MultiMatrix;
