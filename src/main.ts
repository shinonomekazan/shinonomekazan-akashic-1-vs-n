import { gameScene } from "./scenes/gameScene";
import { activeScene } from "./scenes/activeScene";

declare global {
	var gameLayer: g.E;
	var debugLayer: g.E;
	var debugMode: boolean;
	var gotoSheetName: string;
}

async function main(param: g.GameMainParameterObject): Promise<void> {
	globalThis.debugMode = true;

	g.game.vars.font = new g.DynamicFont({
		game: g.game,
		fontFamily: "M PLUS 1",
		size: 60,
		fontWeight: "bold",
	});
	console.clear();
	console.log('main scene, id: ', g.game.selfId, ', isActive: ', g.game.isActiveInstance());

	let scene: g.Scene;
	if (g.game.isActiveInstance()) {
		console.log('add active scene');
		scene = new activeScene({
			game: g.game,
			name: "active scene",
		});
	} else {
		console.log('add game scene');
		scene = new gameScene({
			game: g.game,
			name: "game scene",
			snapshot: param.snapshot
		});
	}
	console.log('pushscene ', scene.name);
	g.game.pushScene(scene);
}
export = main;