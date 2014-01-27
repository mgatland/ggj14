"use strict";
define(function () {

	var Popover = function (name) {	
		var isShown = false;

		this.show = function () {
			if (isShown) return;
			isShown = true;
			document.querySelector('.popover.' + name).classList.toggle("hidden", false);
		}

		this.hide = function () {
			if (isShown === false) return;
			isShown = false;
			document.querySelector('.popover.' + name).classList.toggle("hidden", true);
		}

		this.isShown = function () {
			return isShown;
		}
	}

	return Popover;
});