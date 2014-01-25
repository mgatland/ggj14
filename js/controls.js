"use strict";
define(function () {
	var Controls = function (i) {
		this.i = i;
		var state = "";
		var selectedAction = "";
		var coolDown = 0;
		var maxCoolDown = 0;
		
		var ele = document.querySelector(".p" + i + ".controls");
		var cooldownEle = document.querySelector(".p" + i + ".controls .cooldown");
		cooldownEle.style.width =  "0%";

		this.update = function () {
			if (state === "wait") {
				if (coolDown > 0) {
					coolDown--;
					var coolPercentage = Math.round(coolDown * 100 / maxCoolDown);
					cooldownEle.style.width = coolPercentage + "%";
					console.log(coolPercentage);
				} else {
					setState("chooseAction");
				}
			}
		}

		this.actionSelected = function (act) {
			if (state !== "chooseAction") return;
			selectedAction = act;
			setState("chooseTarget");
		}

		var useAction = function (action, targetNum) {
			console.log("Action: " + action + " on target " + targetNum);
			selectedAction = "";
			setState("wait");
			coolDown = 30;
			maxCoolDown = coolDown;
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