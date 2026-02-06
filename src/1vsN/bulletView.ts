import { bulletModel } from "./bulletModel";

export class bulletView {
	entity: g.FilledRect;
	model: bulletModel;

	constructor(scene: g.Scene, model: bulletModel) {
		this.model = model;
		this.entity = new g.FilledRect({
			scene: scene,
			width: 5, height: 5,
			cssColor: "#8c2f21",
			x: model.x, y: model.y,
			anchorX: 0.5, anchorY: 0.5
		});
		scene.append(this.entity);
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