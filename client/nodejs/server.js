var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var path = require("path");
var MultiMatrix = require("./multimatrix");

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

app.use(express.static(__dirname + '/site'));
app.get("/", function (req, res){
	res.sendFile(path.join(__dirname, "site/livecontrol.html"));
});

var beat = 0;

io.on("connection", function (socket) {
	socket.on("beat", function () {
		beat = 10;
	});
});

setInterval(function () {
	for (var x = 0; x < 10; x++) {
		for (var y = 0; y < 10; y++) {
			matrix.setPixelAll(x, y, { red : beat * 26 , green : beat *26, blue : beat * 26});
		}
	}
	matrix.flip();
	if (beat > 0) beat -= 0.3;
	if (beat < 0) beat = 0;
}, 10);

http.listen(8080, function () {
	console.log("Server started!");
});
