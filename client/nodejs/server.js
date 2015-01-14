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
	left : {
		ip : "192.168.0.91",
		port : 2711,
		lookup_file : "lookup.csv",
		xoffset : 0,
		yoffset : 0
	},
	right : {
		ip : "192.168.0.80",
		port : 2711,
		lookup_file : "lookup.csv",
		xoffset : 10,
		yoffset : 10
	}
});

var anim = AnimationManager(matrix);

anim.setAnimation("strobe", { color : "blue" });
setInterval(function () {
	anim.draw();
}, 1000 / FPS);

app.use(express.static(__dirname + "/site"));
app.get("/", function (req, res){
	res.sendFile(path.join(__dirname, "site/livecontrol.html"));
});

io.on("connection", function (socket) {
	socket.on("event", function (type) {
		anim.event(type);
	});
});

http.listen(8080, function () {
	console.log("Server started!");
});
