var path = require("path");
var fs = require("fs");

var animations = {};
var animation_active = null;

fs.readdirSync(__dirname).forEach(function (fn) {
	if (fn != "index.js") {
		var mods = require(path.join(__dirname, fn));
		for (var name in mods) {
			animations[name] = mods[name];
		}
	}
});

module.exports = function (matrix) {
	return {
		setAnimation : function (name, settings) {
			if (animation_active) animations[animation_active].terminate();
			animation_active = name;
			if (!animation_active) return false;
			animations[animation_active].init(matrix, settings);
		},

		getActiveName : function () {
			return animation_active;
		},

		getAnimations : function () {
			return animations;
		},

		draw : function () {
			if (!animation_active) return false;
			animations[animation_active].draw(matrix);
			matrix.flip();
		},

		event : function (ev) {
			if (!animation_active) return false;
			animations[animation_active].event(ev);
		}
	};
};
