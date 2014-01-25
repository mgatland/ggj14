"use strict";
define(function () {

	var Shoot = function () {
		this.name = "Shooting"
		this.verb = " fire at ";
		this.needsTarget = true;
		this.cooldown = 30;
		this.coverDamage = 1;
		this.isFatal = true;
	}

	var FindCover = function () {
		this.name = "Taking Cover"
		this.verb = " move back to find cover.";
		this.needsTarget = false;
		this.cooldown = 60;
		this.coverCost = -2;
	}

	var Charge = function () {
		this.name = "Charging"
		this.verb = " charge forwards!";
		this.needsTarget = false;
		this.cooldown = 30;
		this.coverCost = 4;
		this.targets = "both enemies";
		this.coverDamage = 2;
	}

	var Creature = function (id, name, cover, energy, aim, dodge, leadership, creatures, isAI) {
		var c = this; //for private methods
		this.id = id;
		this.name = name;
		this.cover = cover;
		this.maxCover = cover;
		this.energy = energy;
		this.maxEnergy = energy;
		this.aim = aim;
		this.dodge = dodge;
		this.leadership = leadership;
		this.isAI = isAI ? true : false;

		this.alive = true;
		this.deadTimer = 0;

		var cooldownEle;
		var cooldownLabelEle;
		this.lastActionText = "";
		this.cooldown = 0;
		this.maxCooldown = 0;

		var init = function () {
			cooldownEle = getElement("cooldown");
			cooldownLabelEle = getElement("bar .label");
			if (c.isAI) c.cooldown = Math.floor(Math.random() * 30) + 30;
		}

		this.die = function () {
			if (!this.alive) return;
			this.alive = false;
			console.log(this.name + " died.");
			this.deadTimer = 300;
		}

		var randomEnemyId = function () {
			var enemies = getEnemies();
			if (!enemies[0].alive) return 1;
			if (!enemies[1].alive) return 0;
			return enemies[Math.floor(Math.random() * 2)].id;
		}

		var getEnemies = function () {
			var enemies = [];
			if (c.id === 0 || c.id === 1) {
				enemies.push(creatures[2]);
				enemies.push(creatures[3]);
			} else {
				enemies.push(creatures[0]);
				enemies.push(creatures[1]);
			}
			return enemies;
		}

		this.actions = [];
		this.actions.push(new Shoot());
		this.actions.push(new FindCover());
		this.actions.push(new Charge());

		this.doesActionNeedTarget = function (actionCode) {
			var action = this.actions[actionCode];
			return action.needsTarget;
		}

		this.useAction = function(actionCode, targetCode) {
			var action = this.actions[actionCode];
			if (!action) {
				alert("Error: this action does not exist: " + actionCode);
				return;
			}
			if (this.cooldown > 0) {
				console.log(this.name + " tried to use an action but needs to cool down.");
				return;
			}
			var target = (typeof targetCode == "number") ? creatures[targetCode] : null;
			if (!action.energyCost || this.energy >= action.energyCost) {
				if (target === null) {
					console.log("You" + action.verb);
					if (action.targets === "both enemies") {
						getEnemies().forEach(function (target) {
							if (action.isFatal && target.cover <= 0) target.die();
							if (action.coverDamage) target.cover -= action.coverDamage;
						});
					}
				} else {
					if (action.isFatal && target.cover <= 0) target.die();
					if (action.coverDamage) target.cover -= action.coverDamage;	
					console.log("You" + action.verb + target.name);
				}
				if (action.energyCost) this.energy -= action.energyCost;
				if (action.coverCost) this.cover -= action.coverCost;
				
				creatures.forEach(function (c) {
					c.draw();
				})
				this.maxCooldown = action.cooldown;
				if (this.isAI) this.maxCooldown *= 2;
				this.cooldown = this.maxCooldown;
				this.lastActionText = action.name;
				return;
			} else {
				console.log("Not enough energy to do that.");
				return;
			}
		};

		var runAI = function () {
			var enemies = getEnemies();
			if (!enemies[0].alive && !enemies[1].alive) return;
			if (c.cover < 2 && Math.random() > 0.3) c.useAction(1);
			c.useAction(0, randomEnemyId());
		};

		this.update = function () {
			if (this.deadTimer > 0) {
				this.deadTimer--;
			}

			if (this.cooldown > 0) {
				this.cooldown--;
				var coolPercentage = Math.floor(this.cooldown * 100 / this.maxCooldown);
				cooldownEle.style.width = coolPercentage + "%";
				cooldownLabelEle.innerHTML = this.lastActionText;
			} else {
				cooldownEle.style.width = 0;
				cooldownLabelEle.innerHTML = "";
			}

			if (this.cooldown <= 0 && this.alive && this.isAI) {
				runAI();
			}
		}

		this.draw = function () {
			getElement("name").innerHTML = this.name;
			getElement("cover").innerHTML = "Cover: " + this.cover + "/" + this.maxCover;
			getElement("energy").innerHTML = "Energy: " + this.energy + "/" + this.maxEnergy;
			getElement("aim").innerHTML = "Aim: " + this.aim;
			getElement("dodge").innerHTML = "Dodge: " + this.dodge;
			getElement("leadership").innerHTML = "Leadership: " + this.leadership;
			getElement().classList.toggle("dead", !this.alive);
		}

		var getElement = function(ele) {
			if (ele) {
				return document.querySelector(".card.p" + id + " ." + ele);
			} else {
				return document.querySelector(".card.p" + id); 
			}
		}
		init();
	}
return Creature;
});