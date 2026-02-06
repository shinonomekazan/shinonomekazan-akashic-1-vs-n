import { Helper } from "../helper";
import { zombieModel } from "./zombieModel";

export class zombieView {
	entity: g.Sprite;
	model: zombieModel;

	constructor(scene: g.Scene, model: zombieModel) {
		this.model = model;
		this.entity = Helper.newSprite(model.color);
		this.entity.anchor(0.5, 0.5);
		this.entity.scale(0.06);
		scene.append(this.entity);
		this.lookAt(model.x, model.y);
	}
	lookAt(targetX: number, targetY: number) {
		const radians = Math.atan2(targetY - this.model.y, targetX - this.model.x);
		const degrees = radians * (180 / Math.PI);

		this.entity.angle = degrees - 90;
		this.entity.modified();
	}
	update() {
		this.entity.x = this.model.x;
		this.entity.y = this.model.y;
		this.entity.modified();
	}

	destroy() {
		if (this.entity && !this.entity.destroyed()) {
			this.entity.destroy();
		}
	}
}