import { bossView } from "./bossView";
import { gameController } from "./gameController";
import { zombieModel } from "./zombieModel";
import { zombieView } from "./zombieView";
import { bulletModel } from "./bulletModel";
import { bulletView } from "./bulletView";

export class gameRenderer {
	scene: g.Scene;
	controller: gameController;
	bossView: bossView | null;
	zombieMap: Map<zombieModel, zombieView>;
	bulletMap: Map<bulletModel, bulletView>;
	playerStatusMap: Map<string, g.Label>;
	statsContainer: g.E;
	timerLabel: g.Label;
	timerBarBg: g.FilledRect;
	timerBar: g.FilledRect;
	font: g.Font;

	constructor(scene: g.Scene, controller: gameController) {
		this.scene = scene;
		this.controller = controller;
		this.zombieMap = new Map();
		this.bulletMap = new Map();
		this.playerStatusMap = new Map();

		this.font = new g.DynamicFont({
			game: g.game,
			fontFamily: "sans-serif",
			size: 15
		});

		this.statsContainer = new g.E({ scene: scene, x: 10, y: 10 });
		scene.append(this.statsContainer);

		// Timer Background
		this.timerBarBg = new g.FilledRect({
			scene: scene,
			x: 10,
			y: g.game.height - 30,
			width: g.game.width - 20,
			height: 20,
			cssColor: "gray",
			opacity: 0.5
		});
		scene.append(this.timerBarBg);

		// Timer Bar
		this.timerBar = new g.FilledRect({
			scene: scene,
			x: 10,
			y: g.game.height - 30,
			width: g.game.width - 20,
			height: 20,
			cssColor: "#00FF00"
		});
		scene.append(this.timerBar);

		this.timerLabel = new g.Label({
			scene: scene,
			font: new g.DynamicFont({
				game: g.game,
				fontFamily: "monospace",
				size: 18,
				fontWeight: "bold"
			}),
			text: "",
			textColor: "black",
			x: 15,
			y: g.game.height - 50
		});
		scene.append(this.timerLabel);

		if (controller.boss) {
			const isBossSelf = controller.bossPlayerId === controller.selfId;
			this.bossView = new bossView(scene, controller.boss, this.font, isBossSelf);
		} else {
			this.bossView = null;
		}
	}

	reset() {
		this.zombieMap.forEach(v => v.destroy());
		this.zombieMap.clear();
		this.bulletMap.forEach(v => v.destroy());
		this.bulletMap.clear();
		if (this.bossView) this.bossView.reset();
	}

	update() {
		// Update Timer Bar
		const maxW = g.game.width - 20;
		const ratio = Math.max(0, this.controller.remainingTime / this.controller.maxTime);
		this.timerBar.width = maxW * ratio;

		// Change color based on remaining time
		if (ratio < 0.2) this.timerBar.cssColor = "red";
		else if (ratio < 0.5) this.timerBar.cssColor = "yellow";
		else this.timerBar.cssColor = "#00FF00";

		this.timerBar.modified();

		if (this.bossView) {
			this.bossView.update();

			if (this.controller.isGameOver) {
				this.bossView.showGameEnd(this.controller.winner!);
			}
		}

		const timeLeft = Math.ceil(this.controller.remainingTime);
		this.timerLabel.text = `TIME: ${timeLeft}`;
		if (timeLeft <= 10) {
			this.timerLabel.textColor = "red";
		} else {
			this.timerLabel.textColor = "black";
		}
		this.timerLabel.invalidate();

		const activeZombies = new Set<zombieModel>();
		this.controller.enemyPlayers.forEach(player => {
			player.zombies.forEach(zombie => {
				activeZombies.add(zombie);
				if (!this.zombieMap.has(zombie)) {
					let view = new zombieView(this.scene, zombie);
					this.zombieMap.set(zombie, view);
					if (this.bossView) {
						view.lookAt(this.bossView.model.x, this.bossView.model.x);
					}
				}
				this.zombieMap.get(zombie)?.update();
			});
		});

		this.zombieMap.forEach((view, model) => {
			if (!activeZombies.has(model)) {
				view.destroy();
				this.zombieMap.delete(model);
			}
		});

		const activeBullets = new Set<bulletModel>();
		if (this.controller.boss) {
			this.controller.boss.bullets.forEach(bullet => {
				activeBullets.add(bullet);
				if (!this.bulletMap.has(bullet)) {
					this.bulletMap.set(bullet, new bulletView(this.scene, bullet));
				}
				this.bulletMap.get(bullet)?.update();
			});
		}

		this.bulletMap.forEach((view, model) => {
			if (!activeBullets.has(model)) {
				view.destroy();
				this.bulletMap.delete(model);
			}
		});

		let yOffset = 0;
		this.controller.enemyPlayers.forEach((player) => {
			let label = this.playerStatusMap.get(player.id);

			if (!label) {
				label = new g.Label({
					scene: this.scene,
					font: this.font,
					fontSize: 14,
					textColor: "black",
					text: ""
				});
				this.statsContainer.append(label);
				this.playerStatusMap.set(player.id, label);
			}

			const isSelf = player.id === this.controller.selfId;

			let nameDisplay = `P: ${player.id}`;
			if (isSelf) {
				nameDisplay += " (YOU)";
			}

			const cooldown = player.getCooldownRemaining();
			const statusText = isSelf ? (cooldown > 0 ? `(Wait ${cooldown}s)` : `(Ready)`) : "";

			let textColor = "black";
			if (isSelf) {
				if (cooldown > 0) textColor = "gray"
				else textColor = "black";
			}

			label.text = `${nameDisplay} | Zombies: ${player.spawnCount} ${statusText}`;
			label.textColor = textColor;
			label.y = yOffset;
			label.invalidate();

			yOffset += 20;
		});
	}
}
