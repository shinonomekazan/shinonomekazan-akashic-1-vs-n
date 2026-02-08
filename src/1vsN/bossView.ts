import { Helper } from "../helper";
import { bossModel } from "./bossModel";

export class bossView {
	container: g.E;
	body: g.E;
	hpLabel: g.Label;
	endGameLabel: g.Label;
	killLabel: g.Label;
	model: bossModel;
	scene: g.Scene;
	isSelf: boolean;

	constructor(scene: g.Scene, model: bossModel, font: g.Font, isSelf: boolean) {
		this.scene = scene;
		this.model = model;
		this.isSelf = isSelf;

		this.container = new g.E({
			scene: scene,
			x: model.x,
			y: model.y
		});

		this.body = new g.E({
			scene: scene,
			width: 40, height: 40,
			anchorX: 0.5, anchorY: 0.5,
		});
		let tank = Helper.newSprite("/assets/tank.png");
		tank.anchor(.5, .5);
		this.body.scale(.1)
		tank.angle = 90;
		this.body.append(tank)
		this.body.modified();

		this.container.append(this.body);

		this.endGameLabel = new g.Label({
			scene: scene,
			text: `GAME OVER`,
			font: font,
			anchorX: 0.5,
			anchorY: 0.5,
			fontSize: 30,
			textColor: "black",
			x: g.game.width / 2,
			y: g.game.height / 2,
			local: true
		});
		this.hpLabel = new g.Label({
			scene: scene,
			text: `${model.hp}`,
			font: font,
			fontSize: 14,
			textColor: "black",
			x: -20, y: -40
		});

		this.container.append(this.hpLabel);
		scene.append(this.endGameLabel);
		this.endGameLabel.hide();

		this.killLabel = new g.Label({
			scene: scene,
			text: `Kills: 0`,
			font: font,
			fontSize: 14,
			textColor: "red",
			x: -20, y: 30
		});
		this.container.append(this.killLabel);

		scene.append(this.container);
	}

	reset() {
		this.endGameLabel.hide();
		this.body.angle = 0;
		this.body.modified();
		this.update();
	}

	showGameEnd(winner: string) {
		if (this.endGameLabel.visible()) return;

		let msg = "";
		let color = "black";

		if (winner === 'boss') {
			if (this.isSelf) {
				msg = "TIME UP! You Win!";
				color = "blue";
			} else {
				msg = "TIME UP! Boss Wins!";
				color = "red";
			}
		} else {
			if (this.isSelf) {
				msg = "GAME OVER, You Defeated!";
				color = "red";
			} else {
				msg = "Zombies Win!";
				color = "blue";
			}
		}

		this.endGameLabel.text = msg;
		this.endGameLabel.textColor = color;
		this.endGameLabel.y = -100;
		this.endGameLabel.invalidate();
		this.endGameLabel.show();
		Helper.moveToAsync(this.endGameLabel, g.game.width / 2, g.game.height / 2 - 100, 500).then(() => { });
	}

	update() {
		this.body.angle = this.model.angle;

		const hpText = `HP: ${Math.ceil(this.model.hp)}`;
		this.hpLabel.text = this.isSelf ? `${hpText} (YOU)` : hpText;

		this.hpLabel.textColor = this.isSelf ? "blue" : "black";
		this.hpLabel.invalidate();

		this.killLabel.text = `Kills: ${this.model.killCount}`;
		this.killLabel.invalidate();

		this.body.modified();
		this.container.modified();
	}
}
