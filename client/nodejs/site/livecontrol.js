var socket = io();
var animations = {};

// $(document).keypress gets "Left", "Right", "Up", "Down" keypresses (e.g. firefox)
// --> don't manually generate them
var RECEIVES_ARROW_KEYPRESS = false;

$(function() {
	// Update next animation whenever it changes
	socket.on("sync_queue", function (queue) {
		if (!queue[0]) return;
		$("#next").text(animations[queue[0].animation].name);
	});

	socket.emit("get_animations", null, function (res) {
		animations = res;
	});

	// Prepare preview rendering
	var preview = $("#preview")[0].getContext("2d");
	var preview_w = $("#preview").width();
	var preview_h = $("#preview").height();
	preview.canvas.width = preview_w;
	preview.canvas.height = preview_h;

	var update_width = function () {
		preview_w = $("#preview").width();
		preview_h = $("#preview").height();
		if (preview.canvas.width != preview_w) preview.canvas.width = preview_w;
		if (preview.canvas.height != preview_h) preview.canvas.height = preview_h;
	};

	$(window).resize(update_width);
	setInterval(update_width, 100);

	preview.fillStyle = "#000";
	preview.fillRect(0, 0, preview_w, preview_h);

	// Refresh live preview
	setInterval(function () {
		socket.emit("get_preview", null, function (fb) {
			var totalx = fb.length;
			var totaly = fb[0].length;

			var size = Math.floor(preview_w / totalx);
			if (preview_h / totaly < size)
				size = Math.floor(preview_h / totaly);

			// Calculate alignment offset
			var xalign = (preview_w - size * totalx) / 2;
			var yalign = (preview_h - size * totaly) / 2;

			for (var x = 0; x < totalx; x++) {
			for (var y = 0; y < totaly; y++) {
				// Set pixel color
				var px = fb[x][y];
				var r = (px && px.red) ? Math.floor(px.red) : 0;
				var g = (px && px.green) ? Math.floor(px.green) : 0;
				var b = (px && px.blue) ? Math.floor(px.blue) : 0;
				preview.fillStyle = "rgb("+ r +","+ g +","+ b +")";

				// Set pixel position
				var xoffs = Math.floor(x * size + xalign);
				var yoffs = Math.floor(y * size + yalign);
				preview.fillRect(xoffs, yoffs, size - 1, size - 1);
			}}

			// Update current animation + description
			socket.emit("get_current_animation", null, function (name) {
				$("#active").text("");
				$("#description").text("");
				if (!animations[name]) return;
				$("#active").text(animations[name].name);
				$("#description").text(animations[name].description);
			});
		});
	}, 20);

	// Chromium: Send arrow keys
	$(document).keydown(function(e) {
		if (RECEIVES_ARROW_KEYPRESS) return;
		var key = null;
		if(e.keyCode == 37) key = "Left";
		if(e.keyCode == 38) key = "Up";
		if(e.keyCode == 39) key = "Right";
		if(e.keyCode == 40) key = "Down";
		if (key) socket.emit("event", { type : "keypress", data : key });
	});

	// Send animation events, such as rhythm
	$(document).keypress(function(e) {
		if (!e.key) e.key = String.fromCharCode(e.charCode);
		if (e.key == "Up" || e.key == "Down" || e.key == "Left" || e.key == "Right")
			RECEIVES_ARROW_KEYPRESS = true;
		if (e.key) socket.emit("event", { type : "keypress", data : e.key });

		if (e.key == "n") {
			socket.emit("next_animation");
		}

		if (e.key == "a" || e.key == "s" || e.key == "d" || e.key == "f") {
			socket.emit("event", { type : "beat" });
		}
	});
});
