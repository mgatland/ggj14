"use strict";
require(["creature", "controls"], function(Creature, Controls) {

	var Action = function () {

	}

	var creatures = [];
	creatures[0] = new Creature(0, "Sophia", 5, 5, 5, 5, 5);
	creatures[1] = new Creature(1, "Amanda", 7, 4, 5, 4, 6);
	creatures[2] = new Creature(2, "Bandit", 5, 5, 5, 5, 5);
	creatures[3] = new Creature(3, "Bandit Leader", 5, 5, 5, 5, 5);

	creatures.forEach(function (c) {
		c.draw();
	});

	var controls = [];
	controls[0] = new Controls(0);
	controls[1] = new Controls(1);

	var addControlsEventListener = function (i) {
		var controlsEle = document.querySelector('.controls.p' + i);
		controlsEle.addEventListener('click', function (event) {
		    if (event.target.classList.contains('actionbutton')) {
		        var action = event.target.className.replace("actionbutton", "").replace(" ", "");
		        controls[i].actionSelected(action);
		    }
		}, false);
	}

	for (var i = 0; i < 2; i++) {
		addControlsEventListener(i);
	}

	var cardSelected = function(num) {
		console.log("Card selected: " + num);
		controls[0].cardSelected(num);
		controls[1].cardSelected(num);
	}

	var cardsEle = document.querySelector('.cards');
	cardsEle.addEventListener('click', function (event) {
		var node = event.target;
		while(node && !node.classList.contains('card')) {
		    node = node.parentNode;
		}
		var num = 0;
		for (var i = 0; i < 4; i++) {
			if (node.classList.contains("p" + i)) num = i;
		}
		cardSelected(num);
	}, false);

	window.setInterval(function () {
		controls[0].update();
		controls[1].update();
	}, 1000/60);
});