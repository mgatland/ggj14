define(["Actions", "Creature"], function (Actions, Creature) {

	var allActions = [Actions.Shoot, Actions.FindCover, Actions.Charge, Actions.Protect];
	var antisocialActions = [Actions.Shoot, Actions.FindCover, Actions.Charge];

	var gobnit = {name: "Gobnit", pic: "gobnit.png", greeting: "'Garble garble'", cover: 3, actions: antisocialActions, isAI:true, speed: 0.5};
	var weewit = {name: "Weewit", pic: "weewit.png", greeting: "'Target assigned.", cover: 4, actions: antisocialActions, isAI:true, speed: 0.75};
	var leepig = {name: "Leepig", pic: "leepig.png", greeting: "'Leave me alone!'", cover: 5, actions: allActions, isAI:true, speed: 0.5};
	var dopnot = {name: "Dopnot", pic: "dopnot.png", greeting: "'Grr! Zeek!'", cover: 6, actions: antisocialActions, isAI:true, speed: 0.75};

	var Chapter = function (name, storyPopover) {

		var enemiesList = [gobnit, gobnit, weewit]; // gobnit, leepig, weewit, gobnit, dopnot];
		var story = "We made it! Time to clear the next zone.";
		var isEnded = false;

		var getEnemiesLeft = function (creatures) {
			var count = enemiesList.length;
			creatures.forEach(function (c) {
				if (c.alive && !c.isHero) count++;
			});
			return count;
		}

		var canMakeEnemy = function () { return enemiesList.length > 0; };

		var makeEnemy = function (slot, creatures) {
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

		this.start = function (creatures) {
			creatures.forEach(function (creature) {
				if (creature.isHero) {
					creature.recover();
				}
			});
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
					creatures[index] = makeEnemy(index, creatures);
					creatures[index].draw();
				}
			});

			if (enemiesLeft === 0 && creatures[2].deadTimer === 0 && creatures[3].deadTimer === 0) {
				endChapter();
			}
		}
	};
	return Chapter;
});