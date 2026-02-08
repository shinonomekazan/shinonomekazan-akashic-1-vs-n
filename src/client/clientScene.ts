import { assetPaths } from "../assetPaths";
import { gameController } from "../1vsN/gameController";
import { gameRenderer } from "../1vsN/gameRenderer";
import { NetworkClient } from "../message/NetworkClient";
import { joinRoomData } from "../message/eventNetwordType";

export interface MainSceneParameterObject extends g.SceneParameterObject {
	snapshot?: any;
}

export class clientScene extends g.Scene {
	private _initialSnapshot: any;
	private gController: gameController
	private gRenderer: gameRenderer;
	private client: NetworkClient;
	private restartBtn: g.E;

	private imgUrls = [
		"/assets/zombies/zombie-green.png",
		"/assets/zombies/zombie-red.png",
		"/assets/zombies/zombie-yellow.png",
	]
	constructor(param: MainSceneParameterObject) {
		console.clear();
		param.assetPaths = assetPaths;
		super(param);
		this._initialSnapshot = param.snapshot;

		this.onStateChange.add(e => {
			if (e == 'before-destroyed') {
				console.log('DES');
			}
		});

		this.onLoad.add(this.onGameLoad, this);
	}

	private initScene() {
		this.client = new NetworkClient(this);
		if (this._initialSnapshot) {
			console.log("Restoring game from snapshot...", this._initialSnapshot);
			this.restoreFromSnapshot(this._initialSnapshot);
		}

		this.client.on("player_joined").add((data) => {
			let jData = data as joinRoomData
			console.log("new player: ", data, g.game.isSkipping);

			if (!this.gController) {
				this.createController(jData.bossId);
			} else {
				if (!this.gController.bossPlayerId) {
					this.gController.bossPlayerId = jData.bossId;
				}
			}

			jData.noBossIds.forEach(id => {
				if (jData.imgUrlIndex > -1) {
					this.gController.addPlayer(id, this.imgUrls[Math.min(jData.imgUrlIndex, this.imgUrls.length - 1)])
				}
			})
		});

		this.client.on("restart_game").add(() => {
			if (this.gController) this.gController.reset();
			if (this.gRenderer) this.gRenderer.reset();
			if (this.restartBtn) this.restartBtn.hide();
		});

		this.sendJoin();
	}

	private async sendJoin() {
		try {
			let d = new joinRoomData();
			d.clientSet("xxx " + g.game.selfId)
			const result = await this.client.request("join_room", d);
		} catch (err) {
			console.error("RPC error:", err);
		}
	}

	private onGameLoad() {
		this.initScene();
	}

	private restoreFromSnapshot(snapshot: any) {
		this.createController(snapshot.bossPlayerId);
		this.gController.initFromSnapshot(snapshot);
	}

	private createController(bossId: string) {
		if (this.gController != undefined) {
			return;
		}

		this.gController = new gameController(bossId, g.game.width, g.game.height, g.game.selfId);
		this.gRenderer = new gameRenderer(this, this.gController);

		this.createRestartButton();

		this.onPointDownCapture.add((ev) => {
			// Ignore if clicking restart button
			if (this.restartBtn && this.restartBtn.visible()) return;

			const playerId = ev.player.id
			this.gController.handleInput(playerId, ev.point.x, ev.point.y);
		});

		// --- GAME LOOP ---
		this.onUpdate.add(() => {
			this.gController.update();
			this.gRenderer.update();

			if (this.gController.isGameOver) {
				if (this.restartBtn && !this.restartBtn.visible()) {
					this.restartBtn.show();
				}
			}
		});
	}

	private createRestartButton() {
		this.restartBtn = new g.E({
			scene: this,
			x: g.game.width / 2,
			y: g.game.height / 2 + 50,
			width: 150,
			height: 50,
			anchorX: 0.5,
			anchorY: 0.5,
			touchable: true,
			local: true
		});

		const bg = new g.FilledRect({
			scene: this,
			width: 150, height: 50,
			cssColor: "#333333",
			opacity: 0.8
		});
		this.restartBtn.append(bg);

		const lbl = new g.Label({
			scene: this,
			text: "RESTART",
			font: new g.DynamicFont({
				game: g.game,
				fontFamily: "sans-serif",
				size: 24,
				fontWeight: "bold"
			}),
			textColor: "white",
			textAlign: "center",
			width: 150,
			anchorY: 0.5,
			y: 25
		});
		this.restartBtn.append(lbl);

		this.restartBtn.onPointDown.add(() => {
			bg.cssColor = "#555555";
			bg.modified();
		});

		this.restartBtn.onPointUp.add(async () => {
			bg.cssColor = "#333333";
			bg.modified();
			try {
				await this.client.request("restart", {});
			} catch (e) {
				console.error(e);
			}
		});

		this.append(this.restartBtn);
		this.restartBtn.hide();
	}
}
