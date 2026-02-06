import { controlID } from "./layout/controller";

export type MessageType =
	"selectGameMode" |
	"readyClicked" |
	"startGamePvP" |
	"control" |
	"gameOver" |
	"playerSyncLock" |
	"join";

export type sendType = "s2c" | "c2s";
export class sendMessage {
	public readonly stype: sendType;
	constructor(st: sendType, public type: MessageType, public data: any) {
		this.stype = st;
	}
}
export class joinMeta {
	constructor(public id: string, public isBoos: boolean) { }
}
export class joinMessage {
	constructor(public meta: joinMeta) { }
}
export class gameMessage {
	constructor(public type: MessageType, public data: any) { }
}

export type gameMode = "pc" | "pp" | "solo" | "readyClicked";
export class selectMode {
	constructor(public mode: gameMode) {
	}
}
export class readyClicked {
	constructor(public idClicked: string) { }
}
export class gameStart {
	constructor(public id1: string, public id2: string, public seed1: number, public seed2: number) { }
}
export class playerControl {
	constructor(public playerId: string, public controlID: controlID) { }
}
export class gameOver {
	constructor(public id: string) { }
}
export class playerSyncLock {
	playerId: string;
	x: number;
	y: number;
	rot: number;
	constructor(playerId: string, x: number, y: number, rot: number) {
		this.playerId = playerId;
		this.x = x;
		this.y = y;
		this.rot = rot;
	}
}
