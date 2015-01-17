var socket = io();

$(function() {
	var preview = $("#preview")[0].getContext("2d");
	var preview_w = $("#preview").width();
	var preview_h = $("#preview").height();
	preview.canvas.width = preview_w;
	preview.canvas.height = preview_h;

	$(window).resize(function () {
		preview_w = $("#preview").width();
		preview_h = $("#preview").height();
		preview.canvas.width = preview_w;
		preview.canvas.height = preview_h;
	});

	preview.fillStyle = "#000";
	preview.fillRect(0, 0, preview_w, preview_h);

	$(document).keypress(function(e) {
		if (e.key == "n") {
			socket.emit("next_animation");
		}

		if (e.key == "a" || e.key == "s" || e.key == "d" || e.key == "f") {
			socket.emit("event", "beat");
		}
	});

	// Refresh live preview
	setInterval(function () {
		socket.emit("get_preview", null, function (fb) {
			var totalx = fb.length;
			var totaly = fb[0].length;

			var size = Math.floor(preview_w / totalx);
			if (preview_h / totaly < size)
				var size = Math.floor(preview_h / totaly);

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
		});
	}, 20);
});
