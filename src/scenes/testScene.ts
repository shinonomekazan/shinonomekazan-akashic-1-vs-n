export class testScene extends g.Scene {
	private id1: string;
	private id2: string;
	constructor(param: g.SceneParameterObject) {
		super(param);
		this.onLoad.add(this.onGameLoad, this);
		this.onUpdate.add(() => {
		})

	}
	private onGameLoad() {
		console.clear();

	}
}