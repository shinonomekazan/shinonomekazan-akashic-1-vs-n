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

	let scene: g.Scene;
	if (g.game.isActiveInstance()) {
		scene = new activeScene({
			game: g.game,
			name: "active scene",
		});
	} else {
		scene = new gameScene({
			game: g.game,
			name: "game scene",
			snapshot: param.snapshot
		});
	}
	g.game.pushScene(scene);
}
export = main;