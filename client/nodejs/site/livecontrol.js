var socket = io();

$(function() {
	$(document).keypress(function(e) {
		if (e.key == "n") {
			socket.emit("next_animation");
		}

		if (e.key == "a" || e.key == "s" || e.key == "d" || e.key == "f") {
			socket.emit("event", "beat");
		}
	});
});
