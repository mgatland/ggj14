"use strict";
require(["creature", "controls", "keyboard"], function(Creature, Controls, Keyboard) {

var startNeptune9 = function(event) {

	var DEBUG = {};
	if (location.search) {
		if (location.search.indexOf("1hit") >= 0) {
			DEBUG.oneHit = true;
		}
	}

	var rylie = {name: "Rylie", pic: "warrior.png", greeting: "Let's go!", cover: 10, isAI:false};
	var brooklyn = {name: "Brooklyn", pic: "missionary.png", greeting: "I sense trouble.", cover: 10, isAI:false};
	var dopnot = {name: "Dopnot", pic: "dopnot.png", greeting: "'Grr! Zeek!'", cover: 6, isAI:true};
	var gobnit = {name: "Gobnit", pic: "gobnit.png", greeting: "'Garble garble'", cover: 3, isAI:true};
	var weewit = {name: "Weewit", pic: "weewit.png", greeting: "'Target assigned.", cover: 4, isAI:true};
	var leepig = {name: "Leepig", pic: "leepig.png", greeting: "'Leave me alone!'", cover: 4, isAI:true};

	var makeEnemy = function(slot, type) {
		if (type === undefined) type = Math.floor(Math.random()*4);
		if (type === 0) return new Creature(slot, dopnot, creatures);
		if (type === 1) return new Creature(slot, gobnit, creatures);
		if (type === 2) return new Creature(slot, weewit, creatures);
		return new Creature(slot, leepig, creatures);
	}

	var keyboard = new Keyboard();
	var creatures = [];
	var controls = [];
	controls[0] = new Controls(0);
	controls[1] = new Controls(1);
	var popoverDelayTimer = 0;

	var restartGame = function () {
		popoverDelayTimer = 0;
		creatures[0] = new Creature(0, rylie, creatures);
		creatures[1] = new Creature(1, brooklyn, creatures);
		creatures[2] = makeEnemy(2);
		creatures[3] = makeEnemy(3);

		creatures.forEach(function (c) {
			c.draw();
		});

		controls[0].setCreature(creatures[0]);
		controls[1].setCreature(creatures[1]);
	}



	restartGame();

	var firstParentWithClass = function (startNode, className) {
		var node = startNode;
		while(node && node.classList && !node.classList.contains(className)) {
	    	node = node.parentNode;
	    	if (!node.classList) return null; //we clicked outside a card.
		}
		return node;
	}

	var addControlsEventListener = function (i) {
		var controlsEle = document.querySelector('.controls.p' + i);
		controlsEle.addEventListener('click', function (event) {
			var node = firstParentWithClass(event.target, 'actionbutton');
		    if (node) {
		        var action = node.className.replace("actionbutton", "").replace(" ", "").replace("act", "");
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
		var node = firstParentWithClass(event.target, 'card');
		if (!node) return;
		var num = 0;
		for (var i = 0; i < 4; i++) {
			if (node.classList.contains("p" + i)) num = i;
		}
		cardSelected(num);
	}, false);

	var popoverShown = false;
	var showPopover = function () {
		if (popoverShown) return;
		popoverShown = true;
		document.querySelector('.popover').classList.toggle("hidden", false);
	}

	var hidePopover = function () {
		if (!popoverShown) return;
		popoverShown = false;
		document.querySelector('.popover').classList.toggle("hidden", true);
	}

	window.setInterval(function () {
		var left = (keyboard.isKeyHit(KeyEvent.DOM_VK_LEFT));
		var right = (keyboard.isKeyHit(KeyEvent.DOM_VK_RIGHT));
		var up = (keyboard.isKeyHit(KeyEvent.DOM_VK_UP));
		var down = (keyboard.isKeyHit(KeyEvent.DOM_VK_DOWN));
		var left2 = (keyboard.isKeyHit(KeyEvent.DOM_VK_A));
		var right2 = (keyboard.isKeyHit(KeyEvent.DOM_VK_D));
		var up2 = (keyboard.isKeyHit(KeyEvent.DOM_VK_W));
		var down2 = (keyboard.isKeyHit(KeyEvent.DOM_VK_S));
		var enter = (keyboard.isKeyHit(KeyEvent.DOM_VK_ENTER)) || (keyboard.isKeyHit(KeyEvent.DOM_VK_RETURN));
		keyboard.update();
		controls[0].update(up2, down2, left2, right2);
		controls[1].update(up, down, left, right);
		creatures.forEach(function (c, index) {
			c.update();
			if (c.alive === false && c.deadTimer === 0 && c.isAI) {
				creatures[index] = makeEnemy(index);
				creatures[index].draw();
			}
		});

		if (creatures[0].alive === false && creatures[1].alive === false) {
			popoverDelayTimer++;
			if (popoverDelayTimer === 60) {
				showPopover();
			}
		}

		if (enter && popoverShown === true) {
			hidePopover();
			restartGame();
		}
	}, 1000/30);

	var addRestartEventListener = function () {
		var buttonEle = document.querySelector('.restartButton');
		buttonEle.addEventListener('click', function (event) {
		    hidePopover();
		    restartGame();
		}, false);
	}

	addRestartEventListener();
};
if (document.readyState !== "loading") {
	startNeptune9();
} else {
	document.addEventListener("DOMContentLoaded", function(event) {
		startNeptune9();
	});
}
});