import { NetworkServer } from "../message/NetworkServer";
import { joinRoomData, plainToClass } from "../message/eventNetwordType";

export class serverScene extends g.Scene {
	private idBoss: string;
	private idOther: string[] = [];
	constructor(param: g.SceneParameterObject) {
		super(param);
		this.onLoad.add(this.onGameLoad, this);
	}

	private onGameLoad() {
		console.clear();
		console.log('server scene loaded, RoomID: ', g.game.playId);
		const server = new NetworkServer(this);
		server.onRpc("join_room", (data, playerId) => {
			console.log('----');
			if (this.idOther.length == 3) {
				console.log('limit player!');
				return;
			}
			const joinData = plainToClass(joinRoomData, data);
			if (this.idOther.includes(playerId)) {
				console.log('alreay ', playerId);
				return;
			}
			console.log(`${playerId} joined with name: ${joinData.name}`);
			console.log('boss ', this.idBoss);
			console.log('other ', this.idOther);
			if (this.idBoss == undefined) {
				this.idBoss = playerId;
			} else {
				if (playerId != this.idBoss) {
					this.idOther.push(playerId);
				}
			}
			joinData.serverSet(playerId, this.idBoss, this.idOther, this.idOther.length - 1);
			console.log(joinData);
			server.broadcast("player_joined", joinData);
			return joinData
		});
	}
}