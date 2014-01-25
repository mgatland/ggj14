"use strict";
require(["creature", "controls"], function(Creature, Controls) {

	var creatures = [];
	creatures[0] = new Creature(0, "Sophia", 5, 5, 5, 5, 5, creatures, false);
	creatures[1] = new Creature(1, "Amanda", 7, 4, 5, 4, 6, creatures, false);
	creatures[2] = new Creature(2, "Bandit", 5, 5, 5, 5, 5, creatures, true);
	creatures[3] = new Creature(3, "Bandit Leader", 5, 5, 5, 5, 5, creatures, true);

	creatures.forEach(function (c) {
		c.draw();
	});

	var controls = [];
	controls[0] = new Controls(0, creatures[0]);
	controls[1] = new Controls(1, creatures[1]);

	var addControlsEventListener = function (i) {
		var controlsEle = document.querySelector('.controls.p' + i);
		controlsEle.addEventListener('click', function (event) {
		    if (event.target.classList.contains('actionbutton')) {
		        var action = event.target.className.replace("actionbutton", "").replace(" ", "").replace("act", "");
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
		while(node && node.classList && !node.classList.contains('card')) {
		    node = node.parentNode;
		    if (!node.classList) return; //we clicked outside a card.
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
		creatures.forEach(function (c, index) {
			c.update();
			if (c.alive === false && c.deadTimer === 0 && c.isAI) {
				creatures[index] = new Creature(index, "Cat", 5, 5, 5, 5, 5, creatures, true);
				creatures[index].draw();
			}
		});
	}, 1000/30);
});