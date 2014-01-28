define(["Actions", "Creature"], function (Actions, Creature) {

	var allActions = [Actions.Shoot, Actions.FindCover, Actions.Charge, Actions.Protect];
	var antisocialActions = [Actions.Shoot, Actions.FindCover, Actions.Charge];

	var gobnit = {name: "Gobnit", pic: "gobnit.png", greeting: "'Garble garble'", cover: 3, actions: antisocialActions, isAI:true, speed: 0.5};
	var weewit = {name: "Weewit", pic: "weewit.png", greeting: "'Target assigned.", cover: 4, actions: antisocialActions, isAI:true, speed: 0.75};
	var leepig = {name: "Leepig", pic: "leepig.png", greeting: "'Leave me alone!'", cover: 5, actions: allActions, isAI:true, speed: 0.5};
	var dopnot = {name: "Dopnot", pic: "dopnot.png", greeting: "'Grr! Zeek!'", cover: 6, actions: antisocialActions, isAI:true, speed: 0.75};

	var chapters = [];
	chapters.push({
		name: "Ambush",
		start: "Look out!",
		end: "We made it. But we're running late. We'll have to cut through the Crime Zone.",
		enemies: [gobnit, weewit]
	});
	chapters.push({
		name:"Crime Zone",
		start:"Gross. It's full of criminals.",
		end:"Good work! We're through the Crime Zone.",
		enemies: [gobnit, weewit, gobnit, leepig, weewit, gobnit, dopnot]
	});
	chapters.push({
		name:"Water Zone",
		start:"Finally, the Water Zone! But it's full of robots?!",
		end:"We can't take this water back home, it's mouldy. Let's find a purifier.",
		enemies: [dopnot, dopnot, weewit, dopnot, weewit, leepig, weewit, dopnot, gobnit]
		});
	chapters.push({
		name:"Slime Zone",
		start:"There'll be a purifier somewhere around here.",
		end:"Found a purifier! Now we can return home.",
		enemies: [gobnit, gobnit, gobnit, gobnit, gobnit]
		});

	var chapterNum = 0;
	var next = function (storyPopover) {
		var chapter = new Chapter(chapters[chapterNum], storyPopover);
		chapterNum++;
		if (chapterNum === chapters.length) chapterNum = 0;
		return chapter;
	}

	var Chapter = function (data, storyPopover) {
		var name = data.name;
		var enemiesList = data.enemies.slice();
		var storyStart = data.start;
		var storyEnd = data.end;
		var isEnded = false;
		var isStarted = false;

		var getEnemiesLeft = function (creatures) {
			var count = enemiesList.length;
			creatures.forEach(function (c) {
				if (c.alive && !c.isHero) count++;
			});
			return count;
		}

		var canMakeEnemy = function () { return enemiesList.length > 0; };

		var makeEnemy = function (slot, creatures) {
			return new Creature(slot, enemiesList.shift(), creatures);
		}

		var endChapter = function () {
			document.querySelector('.storyText').innerHTML = storyEnd;
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
					creature.idleAction();
					creature.draw();
				}
			});

			document.querySelector('.storyText').innerHTML = storyStart;
			storyPopover.show();
		}

		this.cleanUp = function () {
			storyPopover.hide();
		}

		this.reallyStart = function () {
			isStarted = true;
			storyPopover.hide();
		}

		this.update = function (creatures) {
			if (!isStarted) return;
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
	return {next: next};
});