"use strict";
define(function () {

	var QuickShots = function () {
		this.verb = " fire a few rounds at ";
		this.coolDown = 30;
		this.energyCost = 2;
		this.coverDamage = 2;
	}

	var CarefulShot = function () {
		this.verb = " carefully aim and fire at ";
		this.coolDown = 90;
		this.energyCost = 2;
		this.coverDamage = 2;
	}

	var FindCover = function () {
		this.verb = " move back to find cover.";
		this.coolDown = 60;
		this.energyCost = 2;
		this.coverDamage = 2;
	}

	var Charge = function () {
		this.verb = " charge towards ";
		this.coolDown = 30;
		this.energyCost = 2;
		this.coverDamage = 2;
	}

	var Creature = function (i, name, cover, energy, aim, dodge, leadership, creatures) {
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

		this.actions[0] = new QuickShots();
		this.actions[1] = new CarefulShot();
		this.actions[2] = new FindCover();
		this.actions[3] = new Charge();

		this.useAction = function(actionCode, target) {
			var action = this.actions[actionCode];
			if (!action) {
				alert("Error: this action does not exist: " + actionCode);
			}
			var target = creatures[target];
			if (this.energy >= action.energyCost) {
				this.energy -= action.energyCost;
				target.cover -= action.coverDamage;
				console.log("You" + action.verb + target.name);
				this.draw();
				target.draw();
				return action.coolDown;
			} else {
				console.log("Not enough energy to do that.");
				return 2;
			}
		};

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
return Creature;
});