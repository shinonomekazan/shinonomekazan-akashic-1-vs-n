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
	private client: NetworkClient;

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
		const gRenderer = new gameRenderer(this, this.gController);

		this.onPointDownCapture.add((ev) => {
			const playerId = ev.player.id
			this.gController.handleInput(playerId, ev.point.x, ev.point.y);
		});

		// --- GAME LOOP ---
		this.onUpdate.add(() => {
			this.gController.update();
			gRenderer.update();
		});
	}
}
