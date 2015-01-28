var parseColor = require("./parsecolor");
var showFont = require("./showfont");
var INTERVAL_TIME = 0.01;
var FIELD_OFFSET_X = 10;
var FIELD_OFFSET_Y = 10;
var FIELD_WIDTH = 20;
var FIELD_HEIGHT = 10;
var PADDLE_HEIGHT = 6;
var BALL_SPEED_X = 10;
var BALL_SPEED_Y = 14;
var interval, ballx, bally, balldir;
var POINTS1_X = 3;
var POINTS1_Y = 2;
var POINTS2_X = 33;
var POINTS2_Y = 2;
var RESET_ANIMATION_DURATION = 0.5;
var POINTS_TO_WIN = 10;
var WIN_COLOR = parseColor("green");
var LOSE_COLOR = parseColor("red");

var player1_points = 0;
var player2_points = 0;
var paddle1y = FIELD_HEIGHT / 2;
var paddle2y = FIELD_HEIGHT / 2;
var matchtime = 0;
var speed_coeff = 1;
var paddle_size_dec = 0;
var rst_anim_active = false;
var rst_anim_time = 0;
var winner = 0;

function reset_game () {
	rst_anim_active = true;
	rst_anim_time = 0;
	setTimeout(function () {
		paddle_size_dec = 0;
		matchtime = 0;
		speed_coeff = 1;
		ballx = FIELD_WIDTH / 2;
		bally = FIELD_HEIGHT / 2;
		balldir = { x : Math.random() > 0.5 ? 1 : -1, y : Math.random() > 0.5 ? 1 : -1 };
		rst_anim_active = false;
	}, RESET_ANIMATION_DURATION * 1000);
}

function init (matrix, settings) {
	player1_points = 0;
	player2_points = 0;
	winner = 0;
	reset_game();

	interval = setInterval(function () {
		if (winner) return;
		if (rst_anim_active) {
			rst_anim_time += INTERVAL_TIME;
			return;
		}

		ballx += balldir.x * INTERVAL_TIME * BALL_SPEED_X * speed_coeff;
		bally += balldir.y * INTERVAL_TIME * BALL_SPEED_Y * speed_coeff;

		// Upper / lower wall reflection
		if (bally < 0) balldir.y = 1;
		if (bally > FIELD_HEIGHT - 0.5) balldir.y = -1;

		// Left paddle reflection:
		if (ballx < 1) {
			if (bally > paddle1y - PADDLE_HEIGHT / 2 - 0.5
				&& bally < paddle1y + PADDLE_HEIGHT / 2 + 0.5) {
				balldir.x = 1;
			} else {
				player2_points++;
				if (player2_points >= POINTS_TO_WIN) {
					winner = 2;
					return;
				}
				reset_game();
			}
		}

		// Right paddle reflection:
		if (ballx > FIELD_WIDTH - 2) {
			if (bally > paddle2y - PADDLE_HEIGHT / 2 - 0.5
				&& bally < paddle2y + PADDLE_HEIGHT / 2 + 0.5) {
				balldir.x = -1;
			} else {
				player1_points++;
				if (player1_points >= POINTS_TO_WIN) {
					winner = 1;
					return;
				}
				reset_game();
			}
		}

		// Increase difficulty
		matchtime += INTERVAL_TIME;
		if (matchtime >  5 && speed_coeff <= 1  ) speed_coeff = 1.1;
		if (matchtime > 10 && speed_coeff <= 1.1) speed_coeff = 1.2;
		if (matchtime > 15 && speed_coeff <= 1.2) speed_coeff = 1.4;
		if (matchtime > 20 && speed_coeff <= 1.4) speed_coeff = 1.6;
		if (matchtime > 25 && speed_coeff <= 1.6) speed_coeff = 1.8;
		if (matchtime > 25 && speed_coeff <= 1.8) speed_coeff = 2.0;

		if (matchtime >  8 && paddle_size_dec <= 0) paddle_size_dec++;
		if (matchtime > 18 && paddle_size_dec <= 1) paddle_size_dec++;
		if (matchtime > 28 && paddle_size_dec <= 2) paddle_size_dec++;
		if (matchtime > 38 && paddle_size_dec <= 3) paddle_size_dec++;
	}, INTERVAL_TIME * 1000);
}

function draw (matrix) {
	matrix.clear();

	// Draw red for loser, green for winner
	if (winner) {
		var rgb_player1 = winner == 1 ? WIN_COLOR : LOSE_COLOR;
		var rgb_player2 = winner == 2 ? WIN_COLOR : LOSE_COLOR;

		for (var ply = FIELD_OFFSET_Y; ply <= FIELD_OFFSET_Y + FIELD_HEIGHT; ply++) {
			for (var pl1x = 0; pl1x < FIELD_WIDTH / 2; pl1x++) {
				matrix.setPixelGlobal(FIELD_OFFSET_X + pl1x, ply, rgb_player1);
			}

			for (var pl2x =FIELD_WIDTH / 2; pl2x < FIELD_WIDTH; pl2x++) {
				matrix.setPixelGlobal(FIELD_OFFSET_X + pl2x, ply, rgb_player2);
			}
		}
		return;
	}

	if (rst_anim_active) {
		var int = Math.max(0, 1 - (rst_anim_time + 0.1) / RESET_ANIMATION_DURATION);
		matrix.fill({ red : 255 * int, green : 255 * int, blue : 255 * int });
		return;
	}

	var ballx_global = ballx + FIELD_OFFSET_X;
	var bally_global = bally + FIELD_OFFSET_Y;

	// Draw ball as glow
	for (var x = ballx_global - 2; x < ballx_global + 2; x++) {
		for (var y = bally_global - 2; y < bally_global + 2; y++) {
			var xround = Math.round(x);
			var yround = Math.round(y);
			var x2 = (xround - ballx_global) * (xround - ballx_global);
			var y2 = (yround - bally_global) * (yround - bally_global);
			var distance = Math.sqrt(x2 + y2);
			var intensity = Math.max(0, (1 - distance * distance * distance / 1.1));
			var red = Math.round(255 * intensity);
			var green = Math.round(255 * intensity);
			var blue = Math.round(255 * intensity);
			var rgb = { red : red, green : green, blue : blue };
			matrix.setPixelGlobal(Math.round(x), Math.round(y), rgb);
		}
	}

	var rgb_l = { red : 80, green : 0, blue : 0 };
	var rgb_r = { red : 80, green : 0, blue : 0 };
	// Draw right / left end
	for (var yl = FIELD_OFFSET_Y; yl < FIELD_HEIGHT + FIELD_OFFSET_Y; yl++)
		matrix.setPixelGlobal(FIELD_OFFSET_X, yl, rgb_l);

	// Draw right / left end
	for (var yr = FIELD_OFFSET_Y; yr < FIELD_HEIGHT + FIELD_OFFSET_Y; yr++)
		matrix.setPixelGlobal(FIELD_OFFSET_X + FIELD_WIDTH - 1, yr, rgb_r);

	// Draw paddle 1
	var halfheight = (PADDLE_HEIGHT - paddle_size_dec) / 2;
	for (var p1y = -halfheight + paddle1y; p1y < halfheight + paddle1y; p1y++) {
		var p1pixely = Math.round(FIELD_OFFSET_Y + p1y);
		var p1pixelx = FIELD_OFFSET_X;
		matrix.setPixelGlobal(p1pixelx, p1pixely, { red : 255, green : 255 });
	}

	// Draw paddle 2
	for (var p2y = -halfheight + paddle2y; p2y < halfheight + paddle2y; p2y++) {
		var p2pixely = Math.round(FIELD_OFFSET_Y + p2y);
		var p2pixelx = FIELD_OFFSET_X + FIELD_WIDTH - 1;
		matrix.setPixelGlobal(p2pixelx, p2pixely, { red : 255, green : 255 });
	}

	// Draw Points
	showFont(matrix, player1_points.toString(), POINTS1_X, POINTS1_Y, parseColor("white"));
	showFont(matrix, player2_points.toString(), POINTS2_X, POINTS2_Y, parseColor("white"));
}

function event (ev, key) {
	// Move paddles up or down
	if (key == "Up") {
		paddle2y--;
	} else if (key == "Down") {
		paddle2y++;
	} else if (key == "w") {
		paddle1y--;
	} else if (key == "s") {
		paddle1y++;
	}

	// Make sure paddles stay inside the viewing range
	var halfheight = (PADDLE_HEIGHT - paddle_size_dec) / 2;
	if (paddle1y - halfheight < 0) paddle1y = PADDLE_HEIGHT / 2;
	if (paddle1y + halfheight > FIELD_HEIGHT) paddle1y = FIELD_HEIGHT - PADDLE_HEIGHT / 2;
	if (paddle2y - halfheight < 0) paddle2y = PADDLE_HEIGHT / 2;
	if (paddle2y + halfheight > FIELD_HEIGHT) paddle2y = FIELD_HEIGHT - PADDLE_HEIGHT / 2;
}

function terminate () {
	clearInterval(interval);
}

module.exports = {
	pong : {
		name : "Pong",
		init : init,
		draw : draw,
		event : event,
		terminate : terminate,
		description : "Player 1: W/S, Player 2: UpDown"
	}
};
