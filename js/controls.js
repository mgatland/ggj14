"use strict";
define(function () {
	var Controls = function (i, creature) {
		this.i = i;
		var state = "";
		var selectedAction = "";
		
		var ele = document.querySelector(".p" + i + ".controls");
		var cooldownEle = document.querySelector(".p" + i + ".controls .cooldown");
		cooldownEle.style.width =  "0%";

		this.update = function () {
			if (state === "wait") {
				var cooldown = creature.cooldown;
				if (cooldown > 0) {
					var coolPercentage = Math.round(creature.cooldown * 100 / creature.maxCooldown);
					cooldownEle.style.width = coolPercentage + "%";
				} else {
					setState("chooseAction");
				}
			}
		}

		this.actionSelected = function (act) {
			if (state !== "chooseAction") return;
			selectedAction = act;
			if (creature.doesActionNeedTarget(act)) {
				setState("chooseTarget");	
			} else {
				useAction(act, null);
			}
			
		}

		var useAction = function (action, targetNum) {
			var coolDownTime = creature.useAction(action, targetNum);

			selectedAction = "";
			setState("wait");
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

	return Controls;
});