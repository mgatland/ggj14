"use strict";
require(["creature", "controls", "keyboard", "popover", "actions"], function(Creature, Controls, Keyboard, Popover, Actions) {

var startNeptune9 = function(event) {

	var isGameRunning = false;
	var DEBUG = {};
	if (location.search) {
		if (location.search.indexOf("1hit") >= 0) {
			DEBUG.oneHit = true;
		}
		if (location.search.indexOf("aiparty") >= 0) {
			DEBUG.aiParty = true;
		}
	}

	var allActions = [Actions.Shoot, Actions.FindCover, Actions.Charge, Actions.Protect];
	var antisocialActions = [Actions.Shoot, Actions.FindCover, Actions.Charge];

	var rylie = {name: "Rylie", pic: "warrior.png", greeting: "Let's go!", cover: 10, isAI:false, actions: allActions, isHero: true};
	var brooklyn = {name: "Brooklyn", pic: "missionary.png", greeting: "I sense trouble.", cover: 10, isAI:false, actions: allActions, isHero: true};
	
	var gobnit = {name: "Gobnit", pic: "gobnit.png", greeting: "'Garble garble'", cover: 3, actions: antisocialActions, isAI:true, speed: 0.5};
	var weewit = {name: "Weewit", pic: "weewit.png", greeting: "'Target assigned.", cover: 4, actions: antisocialActions, isAI:true, speed: 0.75};
	var leepig = {name: "Leepig", pic: "leepig.png", greeting: "'Leave me alone!'", cover: 5, actions: allActions, isAI:true, speed: 0.5};
	var dopnot = {name: "Dopnot", pic: "dopnot.png", greeting: "'Grr! Zeek!'", cover: 6, actions: antisocialActions, isAI:true, speed: 0.75};

	if (DEBUG.oneHit) {
		rylie.cover = 1;
		brooklyn.cover = 1;
	}
	if (DEBUG.aiParty) {
		rylie.isAI = true;
		brooklyn.isAI = true;
	}

	var advanceStory = function () {
		storyPopover.hide();
		if (chapter.isEnded()) {
			chapter = new Chapter("Random Zone");
		}
	}

	var Chapter = function (name) {

		var enemiesList = [gobnit, gobnit, weewit, gobnit, leepig, weewit, gobnit, dopnot];
		var story = "We made it! Time to clear the next zone.";
		var isEnded = false;
		var that = this;

		var getEnemiesLeft = function (creatures) {
			var count = enemiesList.length;
			creatures.forEach(function (c) {
				if (c.alive && !c.isHero) count++;
			});
			return count;
		}

		var canMakeEnemy = function () { return enemiesList.length > 0; };

		this.makeEnemy = function (slot) {
			return new Creature(slot, enemiesList.pop(), creatures);
		}

		var endChapter = function () {
			document.querySelector('.storyText').innerHTML = story;
			storyPopover.show();
			isEnded = true;
		}

		this.isEnded = function () {
			return isEnded;
		}

		this.update = function (creatures) {
			document.querySelector('.chapterName').innerHTML = name;
			var enemiesLeft = getEnemiesLeft(creatures);
			if (enemiesLeft === 0) {
				var message = "CLEAR";
			} else if (enemiesLeft === 1) {
				var message = "1 enemy left."
			} else {
				message = enemiesLeft + " enemies left.";
			}
			document.querySelector('.enemiesLeft').innerHTML = message;

			creatures.forEach(function (c, index) {
				if (c.alive === false && c.deadTimer === 0 && !c.isHero && canMakeEnemy()) {
					creatures[index] = that.makeEnemy(index);
					creatures[index].draw();
				}
			});

			if (enemiesLeft === 0 && creatures[2].deadTimer === 0 && creatures[3].deadTimer === 0) {
				endChapter();
			}
		}
	}

	var keyboard = new Keyboard();
	var creatures = [];
	var controls = [];
	var chapter = null;
	controls[0] = new Controls(0);
	controls[1] = new Controls(1);
	var restartPopover = new Popover("restart");
	var startGamePopover = new Popover("startgame");
	var storyPopover = new Popover("storyPopover");
	var popoverDelayTimer = 0;

	var restartGame = function () {
		restartPopover.hide();
		startGamePopover.show();
	}

	var startGame = function (noOfPlayers) {
		startGamePopover.hide();
		popoverDelayTimer = 0;

		if (noOfPlayers === 1) {
			rylie.isAI = true;
		} else {
			rylie.isAI = false;
		}

		chapter = new Chapter("Crime Zone");
		creatures[0] = new Creature(0, rylie, creatures);
		creatures[1] = new Creature(1, brooklyn, creatures);
		creatures[2] = chapter.makeEnemy(2);
		creatures[3] = chapter.makeEnemy(3);

		creatures.forEach(function (c) {
			c.draw();
		});

		controls[0].setCreature(creatures[0]);
		controls[1].setCreature(creatures[1]);

		isGameRunning = true;
	}

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

		if (enter && restartPopover.isShown()) {
			restartGame();
		}

		if ((left || left2) && startGamePopover.isShown()) {
			startGame(1);
		}

		if ((right || right2) && startGamePopover.isShown()) {
			startGame(2);
		}

		if (!isGameRunning) return;

		controls[0].update(up2, down2, left2, right2);
		controls[1].update(up, down, left, right);

		if (creatures[0].alive === false && creatures[1].alive === false) {
			popoverDelayTimer++;
			if (popoverDelayTimer === 60) {
				restartPopover.show();
			}
		}

		creatures.forEach(function (c, index) {
			c.update();
		});

		chapter.update(creatures);
	}, 1000/30);

	var addClickEventListener = function (buttonClass, action, arg) {
		var buttonEle = document.querySelector(buttonClass);
		buttonEle.addEventListener('click', function (event) {
		    action(arg);
		}, false);
	}

	addClickEventListener('.restartButton', restartGame);
	addClickEventListener('.onePlayerButton', startGame, 1);
	addClickEventListener('.twoPlayerButton', startGame, 2);
	addClickEventListener('.storyButton', advanceStory);
};
if (document.readyState !== "loading") {
	startNeptune9();
} else {
	document.addEventListener("DOMContentLoaded", function(event) {
		startNeptune9();
	});
}
});