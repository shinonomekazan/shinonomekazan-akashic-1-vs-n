import { assetPaths } from "../assetPaths";
import { gameController } from "../1vsN/gameController";
import { gameRenderer } from "../1vsN/gameRenderer";
import { NetworkClient } from "../message/NetworkClient";
import { joinRoomData } from "../message/eventNetworkType";
import { button9Patch } from "../layout/button9Patch";

export interface MainSceneParameterObject extends g.SceneParameterObject {
	snapshot?: any;
}

export class gameScene extends g.Scene {
	private _initialSnapshot: any;
	private gController: gameController
	private gRenderer: gameRenderer;
	private client: NetworkClient;
	private restartBtn: button9Patch;

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
		console.log('1 init');
		this.client = new NetworkClient(this);
		console.log('2 init');
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
		console.log('3 init');
		this.sendJoin();
	}

	private sendJoin() {
		try {
			let d = new joinRoomData();
			d.clientSet("xxx " + g.game.selfId)
			console.log('1 send');
			this.client.send("join_room", d);
			console.log('2 send');
		} catch (err) {
			console.error("RPC error:", err);
		}
	}

	private onGameLoad() {
		console.log('gameload');
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

			this.gRenderer.update(g.game.isSkipping);

			if (this.gController.isGameOver) {
				if (this.restartBtn && !this.restartBtn.visible()) {
					this.restartBtn.show();
				}
			}
		});
	}

	private createRestartButton() {
		const bgImage = this.asset.getImage("/assets/background-button.png");
		this.restartBtn = new button9Patch({
			scene: this,
			width: 200,
			height: 68,
			backgroundImage: bgImage,
			sliceBorder: { top: 16, bottom: 16, left: 25, right: 55 },
			text: "RESTART",
			font: g.game.vars.font,
			textColor: "white",
			highlightColor: "#CCCCCC",
			onClick: async () => {
				try {
					this.client.send("restart", {});
				} catch (e) {
					console.error(e);
				}
			}
		});

		this.restartBtn.x = g.game.width / 2;
		this.restartBtn.y = g.game.height / 2 + 50;
		this.restartBtn.anchorX = 0.5;
		this.restartBtn.anchorY = 0.5;
		this.restartBtn.modified()
		this.append(this.restartBtn);
		this.restartBtn.hide();
	}
}
