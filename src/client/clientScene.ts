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
			}
		});

		this.initScene();
		this.onLoad.add(this.onGameLoad, this);
	}
	private initScene() {
		const client = new NetworkClient(this);
		client.on("player_joined").add((data) => {
			let jData = data as joinRoomData
			console.log("new player: ", data, g.game.isSkipping);
			this.createController(jData);
			//console.log("L  = ", jData.noBossIds, g.game.isSkipping);
			jData.noBossIds.forEach(id => {
				if (jData.imgUrlIndex > -1) {

					this.gController.addPlayer(id, this.imgUrls[jData.imgUrlIndex])
				}
			})
		});
		client.on("time_updated").add((data) => {
			console.log(`Time: ${data.timeLeft}, `, g.game.isSkipping);
		});
		this.sendJoin(client);
	}
	private async sendJoin(client: NetworkClient) {
		try {
			let d = new joinRoomData();
			d.clientSet("xxx " + g.game.selfId)
			const result = await client.request("join_room", d);
		} catch (err) {
			console.error("RPC error:", err);
		}
	}

	private onGameLoad() {
		let fill = new g.FilledRect({
			cssColor: "lightgrey",
			scene: this,
			width: g.game.width,
			height: g.game.height
		});
		this.append(fill);
	}
	private createController(d: joinRoomData) {
		if (this.gController != undefined) {
			return;
		}
		this.gController = new gameController(d.bossId, g.game.width, g.game.height, g.game.selfId);
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
