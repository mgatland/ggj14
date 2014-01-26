"use strict";
define(function () {

/* line drawing hacks */

var lines = document.querySelector(".lines"); 

function getOffset( el ) { // return element top, left, width, height
    var _x = 0;
    var _y = 0;
    var _w = el.offsetWidth|0;
    var _h = el.offsetHeight|0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return { top: _y, left: _x, width: _w, height: _h };
}

function connect(div1, div2, color, thickness) { // draw a line connecting elements
    var off1 = getOffset(div1);
    var off2 = getOffset(div2);
    // center
    var x1 = off1.left + off1.width / 2;
    var y1 = off1.top + off1.height / 2;
    // center
    var x2 = off2.left + off2.width / 2;
    var y2 = off2.top + off2.height / 2;
    // distance
    var length = Math.sqrt(((x2-x1) * (x2-x1)) + ((y2-y1) * (y2-y1)));
    // center
    var cx = ((x1 + x2) / 2) - (length / 2);
    var cy = ((y1 + y2) / 2) - (thickness / 2);
    // angle
    var angle = Math.atan2((y1-y2),(x1-x2))*(180/Math.PI);

    var iDiv = document.createElement('div');
	iDiv.className = 'line';
	iDiv.style.cssText = "height:" + thickness + "px; background-color:" + color + "; left:" + cx + "px; top:" + cy + "px; width:" + length + "px; -moz-transform:rotate(" + angle + "deg); -webkit-transform:rotate(" + angle + "deg); -o-transform:rotate(" + angle + "deg); -ms-transform:rotate(" + angle + "deg); transform:rotate(" + angle + "deg);"
	lines.appendChild(iDiv);
	setTimeout(function () {
		lines.removeChild(iDiv);
	}, 500);
}

//////

	var Shoot = function () {
		this.name = "Shooting"
		this.verb = " fire at ";
		this.needsTarget = true;
		this.cooldown = 40;
		this.coverDamage = 1;
		this.isFatal = true;
	}

	var FindCover = function () {
		this.name = "Taking Cover"
		this.verb = " move back to find cover.";
		this.needsTarget = false;
		this.cooldown = 90;
		this.coverCost = -2;
	}

	var Charge = function () {
		this.name = "Charging"
		this.verb = " charge forwards!";
		this.needsTarget = false;
		this.cooldown = 60;
		this.coverCost = 4;
		this.targets = "both enemies";
		this.coverDamage = 2;
	}

	var Protect = function () {
		this.name = "Protect teammate";
		this.verb = " protects a teammate.";
		this.needsTarget = false;
		this.cooldown = 90;
		this.coverCost = 2;
		this.teammateCoverCost = -1;
	}

	var Creature = function (id, name, cover, energy, aim, dodge, leadership, creatures, isAI) {
		var c = this; //for private methods
		this.id = id;
		this.name = name;
		this.cover = 0;
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
		var coverTokensEle;
		this.lastActionText = "";
		this.cooldown = 0;
		this.maxCooldown = 0;

		var init = function () {
			cooldownEle = getElement("cooldown");
			cooldownLabelEle = getElement("bar .label");
			coverTokensEle = getElement("coverTokens");
			if (c.isAI) {
				c.cooldown = Math.floor(Math.random() * 30) + 80;
				c.maxCooldown = c.cooldown;
				c.lastActionText = "Get them!";
			}
			c.initCoverTokens(c.maxCover);
		}

		this.die = function () {
			if (!this.alive) return;
			this.alive = false;
			console.log(this.name + " died.");
			this.deadTimer = 300;
		}

		var getFriend = function () {
			if (c.id === 0) return creatures[1];
			if (c.id === 1) return creatures[0];
			if (c.id === 2) return creatures[3];
			if (c.id === 3) return creatures[2];
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
		this.actions.push(new Protect());

		this.doesActionNeedTarget = function (actionCode) {
			var action = this.actions[actionCode];
			return action.needsTarget;
		}

		this.initCoverTokens = function () {
			var tokens = 0;
			while (tokens < this.maxCover) {
				var iDiv = document.createElement('div');
				iDiv.className = 'coverToken';
				coverTokensEle.appendChild(iDiv);
				tokens++;
			}
			this.cover = this.maxCover;
		}

		this.loseCover = function (num) {
			var tokensThatChangedEles = [];
			var tokens = this.cover;
			this.cover -= num;
			if (this.cover < 0) this.cover = 0;
			if (this.cover > this.maxCover) this.cover = this.maxCover;
			while (tokens < this.cover) {
				var tokenToToggle = getElement("coverToken.broken");
				tokenToToggle.classList.remove("broken");
				coverTokensEle.removeChild(tokenToToggle);
				coverTokensEle.appendChild(tokenToToggle);
				tokens++;
				tokensThatChangedEles.push(tokenToToggle);
			}
			while (tokens > this.cover) {
				var tokenToToggle = getElement("coverToken:not(.broken)");
				tokenToToggle.classList.add("broken");
				tokens--;
				tokensThatChangedEles.push(tokenToToggle);
			}

			var inDanger = (this.cover === 0);
			
			getElement().classList.toggle("inDanger", inDanger);

			return tokensThatChangedEles;
		}

		var hurtEnemy = function (target, isFatal, coverDamage, vfxPoints) {
			if (isFatal && target.cover <= 0) {
				target.die();
			}
			if (coverDamage) {
				var newPoints = target.loseCover(coverDamage);
			}
			while (newPoints.length > 0) {
				vfxPoints.push(newPoints.pop());
			}
		}

		this.useAction = function(actionCode, targetCode) {
			var action = this.actions[actionCode];
			var enemyTokens = [];
			var friendTokens = [];
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
							hurtEnemy(target, action.isFatal, action.coverDamage, enemyTokens);
						});
					}
				} else {
					hurtEnemy(target, action.isFatal, action.coverDamage, enemyTokens);
					console.log("You" + action.verb + target.name);
				}
				if (action.energyCost) this.energy -= action.energyCost;
				if (action.coverCost) this.loseCover(action.coverCost);
				if (action.teammateCoverCost) {
					friendTokens = friendTokens.concat(getFriend().loseCover(action.teammateCoverCost));
				}
				
				creatures.forEach(function (c) {
					c.draw();
				})
				this.maxCooldown = action.cooldown;
				if (this.isAI) this.maxCooldown *= 2;
				this.cooldown = this.maxCooldown;
				this.lastActionText = action.name;

				
				var color = "";
				if (this.isAI) {
					color = "rgba(200,100,100,0.4)";
				} else {
					color = "rgba(100,100,200,0.4)";
				}
				enemyTokens.forEach(function (token) {
					var line = connect(token, getElement("bar"), color, 8);
				});
				friendTokens.forEach(function (token) {
					var line = connect(token, getElement("bar"), color, 16);
				});

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
				if (coolPercentage > 92) coolPercentage = 92;
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