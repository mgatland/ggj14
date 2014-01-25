"use strict";
require(["pagelink"], function(util) {

	var Action = function () {

	}

	var Creature = function (i, name, cover, energy, aim, dodge, leadership) {
		this.i = i;
		this.name = name;
		this.cover = cover;
		this.maxCover = cover;
		this.energy = energy;
		this.maxEnergy = energy;
		this.aim = aim;
		this.dodge = dodge;
		this.leadership = leadership;

		this.actions = [];


		this.draw = function () {
			getElement("name").innerHTML = this.name;
			getElement("cover").innerHTML = "Cover: " + this.cover + "/" + this.maxCover;
			getElement("energy").innerHTML = "Energy: " + this.energy + "/" + this.maxEnergy;
			getElement("aim").innerHTML = "Aim: " + this.aim;
			getElement("dodge").innerHTML = "Dodge: " + this.dodge;
			getElement("leadership").innerHTML = "Leadership: " + this.leadership;
		}

		var getElement = function(ele) {
			return document.querySelector(".p" + i + " > ." + ele);
		}
	}

	var creatures = [];
	creatures[0] = new Creature(0, "Sophia", 5, 5, 5, 5, 5);
	creatures[1] = new Creature(1, "Amanda", 7, 4, 5, 4, 6);
	creatures[2] = new Creature(2, "Bandit", 5, 5, 5, 5, 5);
	creatures[3] = new Creature(3, "Bandit Leader", 5, 5, 5, 5, 5);

	creatures.forEach(function (c) {
		c.draw();
	});

	var Controls = function (i) {
		this.i = i;
		var state = "";
		var selectedAction = "";
		var coolDown = 0;
		
		var ele = document.querySelector(".p" + i + ".controls");

		this.actionSelected = function (act) {
			if (state !== "chooseAction") return;
			selectedAction = act;
			setState("chooseTarget");
		}

		var useAction = function (action, targetNum) {
			console.log("Action: " + action + " on " + creatures[targetNum].name);
			selectedAction = "";
			setState("wait");
			coolDown = 30;
		}

		this.cardSelected = function (num) {
			if ( state !== "chooseTarget") {
				return;
			}
			useAction(selectedAction, num);
		}

		var setState = function (newState) {
			state = newState;
			if (state === "chooseTarget") {
				ele.classList.add("chooseTarget");
				ele.classList.remove("chooseAction");
				ele.classList.remove("wait");
			}
			if (state === "chooseAction") {
				ele.classList.remove("chooseTarget");
				ele.classList.add("chooseAction");
				ele.classList.remove("wait");
			}
			if (state === "wait") {
				ele.classList.remove("chooseTarget");
				ele.classList.remove("chooseAction");
				ele.classList.add("wait");
			}
		}

		setState("chooseAction");
	}

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
});