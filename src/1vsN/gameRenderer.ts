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

		if (controller.boss) {
			// Kiểm tra xem Boss có phải là người chơi hiện tại (selfId) không
			const isBossSelf = controller.bossPlayerId === controller.selfId;
			// Truyền cờ isBossSelf vào View
			this.bossView = new bossView(scene, controller.boss, this.font, isBossSelf);
		} else {
			this.bossView = null;
		}
	}

	update() {
		// 1. Update Boss View
		if (this.bossView) {
			this.bossView.update();
		}

		// 2. Update Zombie Views
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

		// 3. Update Bullet Views
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

		// 4. Update Player Status Labels
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

			// Kiểm tra xem đây có phải là bản thân không
			const isSelf = player.id === this.controller.selfId;

			// Format tên hiển thị
			let nameDisplay = `P: ${player.id}`;
			if (isSelf) {
				nameDisplay += " (YOU)";
			}

			const cooldown = player.getCooldownRemaining();
			const statusText = isSelf ? (cooldown > 0 ? `(Wait ${cooldown}s)` : `(Ready)`) : "";

			// Nếu là bản thân thì highlight màu xanh, còn lại theo logic cooldown
			let textColor = "black";
			if (isSelf) {
				if (cooldown > 0) textColor = "gray"
				else textColor = "black";
			}
			//if (isSelf) textColor = "gray";
			//else if (cooldown > 0) textColor = "black";

			label.text = `${nameDisplay} | Zombies: ${player.spawnCount} ${statusText}`;
			label.textColor = textColor;
			label.y = yOffset;
			label.invalidate();

			yOffset += 20;
		});
	}
}
