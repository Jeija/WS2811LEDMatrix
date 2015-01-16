var socket = io();

$(function() {
	$(document).keypress(function(e) {
		if (e.keyCode == 0 || e.keyCode == 32) {
			socket.emit("event", "beat");
		}
	});
});
