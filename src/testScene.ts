import { globalEvent } from "./globalEvent";

export class testScene extends g.Scene {
	private id1: string;
	private id2: string;
	constructor(param: g.SceneParameterObject) {
		super(param);
		this.onLoad.add(this.onGameLoad, this);
		this.onUpdate.add(() => {
		})
		this.setInterval(() => {
			if (g.game.selfId == "user_B") {
				//this.join.fire('hello aaa')
			}
		}, 1000);
	}
	private onGameLoad() {
		console.clear();
		let join = new globalEvent(this);
		join.add((data) => {
			//console.log(data, '|age: ', g.game.age);
			if (data.senderId != null) {
				if (this.id1 == undefined) {
					this.id1 = data.senderId;
				} else {
					if (this.id2 == undefined && this.id1 != data.senderId) {
						this.id2 = data.senderId;
					}
				}
				console.log('play state, p1: ', this.id1, 'p2:', this.id2, g.game.age);
				if (this.id1 != undefined && this.id2 != undefined) {
					this.startGame();
				}
			}
		}, this);
		if (g.game.isActiveInstance() == false) {
			join.fire('hello')
		}
	}
	private startGame() {
		if (g.game.isActiveInstance()) {

		} else {

		}
	}
}