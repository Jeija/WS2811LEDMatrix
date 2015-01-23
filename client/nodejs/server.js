// Load Express, socket.io and other external modules
var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var path = require("path");

// Load MultiMatrix and animations internal modules
var AnimationManager = require("./animations");
var MultiMatrix = require("./multimatrix");

// Config
FPS = 50;

var matrix = new MultiMatrix({
	topLeft : {
		ip : "192.168.0.90",
		port : 2711,
		lookup_file : "lookup.csv",
		xoffset : 0,
		yoffset : 0
	},
	left : {
		ip : "192.168.0.91",
		port : 2711,
		lookup_file : "lookup.csv",
		xoffset : 10,
		yoffset : 10
	},
	right : {
		ip : "192.168.0.80",
		port : 2711,
		lookup_file : "lookup.csv",
		xoffset : 20,
		yoffset : 10
	},
	topRight : {
		ip : "192.168.0.93",
		port : 2711,
		lookup_file : "lookup.csv",
		xoffset : 30,
		yoffset : 0
	},
});

var animqueue = [];
var anim = AnimationManager(matrix);
setInterval(function () {
	anim.draw();
}, 1000 / FPS);

app.use(express.static(__dirname + "/site"));
app.get("/", function (req, res){
	res.sendFile(path.join(__dirname, "site/livecontrol.html"));
});

app.get("/queue", function (req, res){
	res.sendFile(path.join(__dirname, "site/queue.html"));
});

io.on("connection", function (socket) {
	socket.on("event", function (ev) {
		anim.event(ev.type, ev.data);
	});

	socket.on("get_animations", function (_, fn) {
		fn(anim.getAnimations());
		socket.emit("sync_queue", animqueue);
	});

	socket.on("sync_queue", function (queue) {
		animqueue = queue;
		socket.broadcast.emit("sync_queue", animqueue);
	});

	socket.on("next_animation", function (queue) {
		if (animqueue.length > 0) {
			var na = animqueue.shift();
			anim.setAnimation(na.animation, na.settings);
			io.sockets.emit("sync_queue", animqueue);
		}
	});

	socket.on("get_preview", function (_, fn) {
		fn(matrix.getFrameBuffer());
	});

	socket.on("get_current_animation", function (_, fn) {
		fn(anim.getActiveName());
	});
});

http.listen(8080, function () {
	console.log("Server started!");
});
