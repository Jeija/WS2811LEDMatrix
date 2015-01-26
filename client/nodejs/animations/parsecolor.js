var parse_color = require("parse-color");

module.exports = function (colorstring) {
	var color = parse_color(colorstring);
	return {
		red : color.rgb[0],
		green : color.rgb[1],
		blue : color.rgb[2]
	};
};
