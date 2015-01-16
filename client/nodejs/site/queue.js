var socket = io();
var animations = {};

$(function() {
	socket.emit("get_animations", null, function (res) {
		animations = res;
		for (var name in res) {
			var anim = res[name];
			$("<option/>").val(name).text(anim.name).appendTo("#nextanim");
		}
	});

	// Selected another animation --> update settings
	$("#nextanim").change(function () {
		var name = $(this).val();
		var anim = animations[name];

		$("#settings").html("");
		for (var setting in anim.settings) {
			var settingItem = $("<i>invalid setting</i>");
			var settingType = anim.settings[setting];
			if (typeof settingType == "string") {
				settingItem = $('<input type="text" class="setting">')
					.data("setting", setting);
			} else if (Array.isArray(settingType)) {
				settingItem = $('<select class="setting">').data("setting", setting);
				for (var i in settingType) {
					$("<option>")
						.html(settingType[i])
						.attr("value", settingType[i])
						.appendTo(settingItem);
				}
			}

			$("#settings").append($("<tr>")
				.append($("<td>")
					.text(setting))
				.append($("<td>")
					.append(settingItem)));
		}
	});

	$("#setanimation").click(function () {
		// Get selected animation
		var animation = $("#nextanim").val();

		// Collect settings
		var settings = {};
		$(".setting").each(function (i, elem) {
			settings[$(elem).data("setting")] = $(elem).val();
		})

		// Send execute request for next animation
		.promise().done(function () {
			socket.emit("set_animation", { animation : animation, settings : settings });
		});
	});
});
