var socket = io();
var animations = {};

var RECORDING_PLAYBACK_INTERVAL = 0.01;

var recording = false;
var recording_events = [];
var recording_begin;
var recording_playback_begin;
var recording_playback_lasttime;
var recording_playback_interval;

// Send animation events, such as rhythm
function send_key_event(key) {
	if (key == "n") socket.emit("next_animation");
	if (key == "a" || key == "s" || key == "d" || key == "f")
			socket.emit("event", { type : "beat" });

	socket.emit("event", { type : "keypress", data : key });
}

// Get place of time on timeline as css style
function recording_timeline_getperc(time) {
	var maxtime = recording_events[recording_events.length - 1].time;

	var offset;
	if (maxtime != 0)
		offset = 90 * time / maxtime;
	else
		offset = 0;

	return offset + "%";
}

// Show events on display area
function recording_update_display() {
	$("#record_events").html("");
	recording_events.forEach(function (ev) {
		$("#record_events").append(
			$("<div>")
				.text(ev.key)
				.addClass("record_event")
				.css("left", recording_timeline_getperc(ev.time))
		);
	});
}

// Record keypresses to replay them
function recording_toggle() {
	recording = !recording;

	if (recording) {
		$("#record_indicator").addClass("recording");
		recording_events = [];
	} else {
		$("#record_indicator").removeClass("recording");
	}
}

// Store keypresses when recording is on
function recording_hook(key) {
	if (!recording) return;
	if (key == "r") return;

	if (recording_events.length == 0)
		recording_begin = Date.now() / 1000;

	recording_events.push({
		time : Date.now() / 1000 - recording_begin,
		key : key
	});

	// Sort by timestamp, just to make sure
	recording_events.sort(function (a, b) {
		if (a.time > b.time) return 1;
		if (a.time < b.time) return -1;
		return 0;
	});

	recording_update_display();
}

function recording_playback_cb() {
	var time = Date.now() / 1000 - recording_playback_begin;

	// Draw red iterator that indicates time
	$("#record_iter").css("left", recording_timeline_getperc(time))

	// See what keys need to be played in the next RECORDING_PLAYBACK_INTERVAL seconds
	recording_events.forEach(function (ev) {
		if (recording_playback_lasttime <= ev.time &&
				time > ev.time)
			send_key_event(ev.key);
	});

	recording_playback_lasttime = time;

	// Playback finished: stop
	var maxtime = recording_events[recording_events.length - 1].time;
	if (time > maxtime) clearInterval(recording_playback_interval);
}

function recording_playback() {
	recording_playback_time = 0;
	recording_playback_lasttime = 0;
	clearInterval(recording_playback_interval);
	recording_playback_begin = Date.now() / 1000;
	recording_playback_interval = setInterval(recording_playback_cb, RECORDING_PLAYBACK_INTERVAL * 1000);
}

$(function() {
	// Update next animation whenever it changes
	socket.on("sync_queue", function (queue) {
		if (!queue[0]) $("#next").html("<i>Queue is empty!</i>");
		else $("#next").text(animations[queue[0].animation].name);
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
			var totalx = fb.length - 1;
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

	// Keyboard controls
	$(document).keypress(function(e) {
		var key = e.key ? e.key : String.fromCharCode(e.charCode);

		// Translate arrow keys to strings
		if(e.keyCode == 37) key = "Left";
		if(e.keyCode == 38) key = "Up";
		if(e.keyCode == 39) key = "Right";
		if(e.keyCode == 40) key = "Down";

		if (key == "r") recording_toggle();
		recording_hook(key);
		if (key == "p") recording_playback();

		send_key_event(key);
	});
});
