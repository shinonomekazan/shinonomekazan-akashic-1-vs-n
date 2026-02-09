import { NetworkServer } from "../message/NetworkServer";
import { joinRoomData, plainToClass } from "../message/eventNetwordType";
import { gameController } from "../1vsN/gameController";
export class serverScene extends g.Scene {
	private idBoss: string;
	private idOther: string[] = [];
	private wasGameOver: boolean = false;
	private server: NetworkServer;
	private gController: gameController;
	private imgUrls = [
		"/assets/zombies/zombie-green.png",
		"/assets/zombies/zombie-red.png",
		"/assets/zombies/zombie-yellow.png",
	];

	constructor(param: g.SceneParameterObject) {
		super(param);
		this.onLoad.add(this.onGameLoad, this);
	}

	private onGameLoad() {
		console.clear();
		console.log('server scene loaded, RoomID: ', g.game.playId);
		this.server = new NetworkServer(this);
		this.onPointDownCapture.add((ev) => {
			const playerId = ev.player.id
			this.gController.handleInput(playerId, ev.point.x, ev.point.y);
		});

		this.server.onRpc("destroy", (data, playerId) => {
			console.log('CLIENT DESS');
			return undefined;
		});
		this.server.onRpc("restart", (data, playerId) => {
			console.log("Restart requested by", playerId);
			if (this.gController) {
				this.gController.reset();
				this.wasGameOver = false;
				this.server.broadcast("restart_game", {});
				this.saveGameSnapshot("Game Restarted");
			}
			return true;
		});

		this.server.onRpc("join_room", (data, playerId) => {
			console.log('----');
			if (this.idOther.length == 3) {
				console.log('limit player!');
				return;
			}
			const joinData = plainToClass(joinRoomData, data);
			this.joinRoom(joinData, playerId);
			return joinData
		});
	}
	private joinRoom(joinData: joinRoomData, playerId: string) {
		if (this.idOther.includes(playerId)) {
			console.log('alreay ', playerId);
			return;
		}
		console.log(`${playerId} joined with name: ${joinData.name}`);
		if (this.idBoss == undefined) {
			this.idBoss = playerId;
			this.gController = new gameController(playerId, g.game.width, g.game.height, "server_host");
			this.setInterval(() => {
				if (this.wasGameOver == false) {
					this.saveGameSnapshot("AutoSave 10s");
				}
			}, 10000);
			this.onUpdate.add(this.onUpdateTick, this);
			this.gController.bossPlayerId = this.idBoss;
			if (this.gController.boss) {
				this.gController.boss.id = this.idBoss;
			}
		} else {
			if (playerId != this.idBoss) {
				this.idOther.push(playerId);
				const imgIndex = this.idOther.length - 1;
				if (imgIndex < this.imgUrls.length) {
					this.gController.addPlayer(playerId, this.imgUrls[imgIndex]);
				}
			}
		}

		joinData.serverSet(playerId, this.idBoss, this.idOther, this.idOther.length - 1);
		console.log(joinData);

		this.server.broadcast("player_joined", joinData);
		this.saveGameSnapshot(`Player ${playerId} joined`);
	}

	private onUpdateTick() {
		this.gController.update();

		// Check for Game Over transition to save immediate snapshot
		if (this.gController.isGameOver && !this.wasGameOver) {
			this.wasGameOver = true;
			this.saveGameSnapshot("Game Over");
		}
	}

	private saveGameSnapshot(reason: string) {
		if (!this.gController) return;
		const snapshotData = this.gController.getSnapshot();
		g.game.requestSaveSnapshot(() => {
			return {
				snapshot: snapshotData,
			};
		});
		console.log(`Snapshot saved: ${reason} at age ${g.game.age}`);
	}
}
