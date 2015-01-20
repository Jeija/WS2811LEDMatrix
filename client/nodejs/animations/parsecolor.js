module.exports = function (colorstring) {
	var color;
	switch (colorstring) {
		case "white":	return { red : 255, green : 255, blue : 255 };
		case "red":	return { red : 255 };
		case "green":	return { green : 255 };
		case "blue":	return { blue : 255 };
		default:	return { red : 0, green : 0, blue : 0 };
	}
};
