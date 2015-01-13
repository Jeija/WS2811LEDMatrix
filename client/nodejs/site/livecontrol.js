var socket = io();

$(function() {
	$(document).keypress(function(e) {
		console.log(e);
		if (e.keyCode == 0 || e.keyCode == 32) {
			console.log("beat");
			socket.emit("beat");
		}
	});
});
