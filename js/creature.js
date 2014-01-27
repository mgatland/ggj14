"use strict";
define(function () {

/* line drawing hacks */

var lines = document.querySelector(".lines");

function getCenter( el ) { // return element top, left, width, height
    var _x = 0;
    var _y = 0;
    var _w = el.offsetWidth|0;
    var _h = el.offsetHeight|0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    //return { top: _y, left: _x, width: _w, height: _h };
    return {x: _x + _w / 2, y: _y + _h / 2};
}

function connect(start, end, color, thickness, duration) { // draw a line connecting elements
    // center
    var x1 = start.x;
    var y1 = start.y;
    // center
    var x2 = end.x;
    var y2 = end.y;
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
	}, duration);
}

//////

	var Shoot = function () {
		this.buttonLabel = "Shoot";
		this.name = "Shooting"
		this.verb = " fire at ";
		this.needsTarget = true;
		this.cooldown = 40;
		this.coverDamage = 1;
		this.isFatal = true;
	}

	var FindCover = function () {
		this.buttonLabel = "Find Cover";
		this.name = "Taking Cover"
		this.verb = " move back to find cover.";
		this.needsTarget = false;
		this.cooldown = 90; //Must be slower than 2 shots
		this.coverCost = -2;
	}

	var Charge = function () {
		this.buttonLabel = "Advance";
		this.name = "Charging"
		this.verb = " charge forwards!";
		this.needsTarget = false;
		this.cooldown = 60; //Should be quicker than 2 shots?
		this.coverCost = 4;
		this.targets = "both enemies";
		this.coverDamage = 2;
	}

	var Protect = function () {
		this.buttonLabel = "Protect";
		this.name = "Protect $teammate";
		this.verb = " protects a teammate.";
		this.needsTarget = false;
		this.cooldown = 40;
		this.coverCost = 2;
		this.teammateCoverCost = -2;
	}

	var Creature = function (id, data, creatures) {
		var c = this; //for private methods
		this.id = id;
		this.name = data.name;
		this.cover = 0;
		this.maxCover = data.cover;
		this.energy = 1;
		this.maxEnergy = 1;
		this.isAI = data.isAI ? true : false;
		this.greeting = data.greeting;
		this.isHero = data.isHero ? true : false;
		var pic = data.pic;

		this.instructionText = ""; //Set by Controls

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
			getElement("portrait").src = "arts/" + pic;
			getElement("overlay").src = "arts/blank.png";
			if (c.isHero) {
				c.cooldown = 45;
				getElement().classList.remove("enemy");
			} else {
				c.cooldown = Math.floor(Math.random() * 30) + 80;
				getElement().classList.add("enemy");
			}
			c.maxCooldown = c.cooldown;
			c.lastActionText = c.greeting;
			c.initCoverTokens(c.maxCover);

		}

		this.die = function () {
			if (!this.alive) return;
			this.alive = false;
			console.log(this.name + " died.");
			getElement("overlay").src = "arts/dead.png";
			updateDangerStatus();
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
			if (!enemies[0].alive) return enemies[1].id;
			if (!enemies[1].alive) return enemies[0].id;
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
			coverTokensEle.innerHTML = ""; //clear tokens from a previous character
			var tokens = 0;
			while (tokens < this.maxCover) {
				var iDiv = document.createElement('div');
				iDiv.className = 'coverToken';
				coverTokensEle.appendChild(iDiv);
				tokens++;
			}
			this.cover = this.maxCover;
			updateDangerStatus();
		}

		this.loseCover = function (num) {
			var effects = [];
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
				effects.push(getCenter(tokenToToggle));
			}
			while (tokens > this.cover) {
				var tokenToToggle = getElement("coverToken:not(.broken)");
				tokenToToggle.classList.add("broken");
				tokens--;
				effects.push(getCenter(tokenToToggle));
			}
			updateDangerStatus();
			return effects;
		}

		var updateDangerStatus = function () {
			var inDanger = (c.cover === 0 && c.alive === true);
			getElement().classList.toggle("inDanger", inDanger);
		}

		var getAttackColor = function () {
			if (c.isHero) {
				return "rgba(100,100,200,0.4)";
			} else {
				return "rgba(200,100,100,0.4)";
			}
		}

		var hurtEnemy = function (target, isFatal, coverDamage, origin) {

			var color = getAttackColor();

			if (isFatal && target.cover <= 0) {
				target.die();
				connect(target.getPortraitPosition(), origin, color, 13, 1000);
			}
			if (coverDamage) {
				var newPoints = target.loseCover(coverDamage);
			}

			newPoints.forEach(function (point) {
				connect(point, origin, color, 8, 500);
			});
		}

		var getAttackOrigin = function () {
			return getCenter(getElement("bar"));
		}

		this.getPortraitPosition = function () {
			return getCenter(getElement("portrait"));
		}

		this.useAction = function(actionCode, targetCode) {
			var action = this.actions[actionCode];
			var origin = getAttackOrigin();
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
							hurtEnemy(target, action.isFatal, action.coverDamage, origin);
						});
					}
				} else {
					hurtEnemy(target, action.isFatal, action.coverDamage, origin);
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
				if (!this.isHero) this.maxCooldown *= 2;
				this.cooldown = this.maxCooldown;

				this.lastActionText = action.name;

				if (action.name.indexOf("$teammate") !== -1) {
					this.lastActionText = this.lastActionText.replace("$teammate", getFriend().name);
				}

				var color = getAttackColor();
				friendTokens.forEach(function (token) {
					connect(token, origin, color, 16, 500);
				});

				return;
			} else {
				console.log("Not enough energy to do that.");
				return;
			}
		};

		var runAI = function () {
			var moves = [];
			var enemies = getEnemies();
			if (enemies[0].alive || enemies[1].alive) {
				//offensive moves
				moves.push({score: 10, move:0, target:randomEnemyId()}); //shoot
				if (c.cover > 5 && enemies[0].cover >= 2 && enemies[1].cover >= 2) {
					moves.push({score: 15, move:2}); //charge
				}
			}
			if (c.cover < 2 && c.cover < c.maxCover && Math.random() > 0.3) {
				moves.push({score: 20, move: 1}); //take cover
			}
			if (c.cover < c.maxCover) {
				moves.push({score: 1, move: 1}); //maybe take cover anyway.
			}
			var friend = getFriend();
			if (friend.alive && friend.cover === 0 && Math.random() > 0.5) {
				moves.push({score: 19, move:3}); //protect
			}
			if (moves.length === 0) return;

			moves.sort(function (a, b) { return a.score - b.score});
			var move = moves.pop();
			c.useAction(move.move, move.target);
		};

		this.update = function () {

			if (this.alive === false) {
				cooldownLabelEle.innerHTML = "";

				if (this.deadTimer > 0) {
					this.deadTimer--;
				}
				return;
			}

			if (this.cooldown > 0) {
				this.cooldown--;
				var coolPercentage = Math.floor(this.cooldown * 100 / this.maxCooldown);
				if (coolPercentage > 92) coolPercentage = 92;
				cooldownEle.style.width = coolPercentage + "%";
				cooldownLabelEle.innerHTML = this.lastActionText;
			} else {
				cooldownEle.style.width = 0;
				if (this.isAI === false) {
					cooldownLabelEle.innerHTML = this.instructionText; //controlled by Controls
				}
			}

			if (this.cooldown <= 0 && this.alive && this.isAI) {
				runAI();
			}
		}

		this.draw = function () {
			getElement("name").innerHTML = this.name;
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