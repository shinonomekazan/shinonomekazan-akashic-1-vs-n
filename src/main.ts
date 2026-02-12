import { gameScene } from "./scenes/gameScene";
import { activeScene } from "./scenes/activeScene";

async function main(param: g.GameMainParameterObject): Promise<void> {
	g.game.vars.debugMode = true;
	g.game.vars.font = new g.DynamicFont({
		game: g.game,
		fontFamily: "M PLUS 1",
		size: 60,
		fontWeight: "bold",
	});
	console.clear();
	console.log('--------start game (main.ts)--------');
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