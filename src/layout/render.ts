import { Trigger } from "@akashic/trigger";
import { Helper } from "../helper";
import { button9Patch } from "./button9Patch";
import { layout } from "./layout";
import * as al from "@akashic-extension/akashic-label";
import { E, TextAlign } from "@akashic/akashic-engine";
import { controller } from "./controller";

export type buttonID = "btnSolo" | "btnPC" | "btnPvP" | "readyCliked" | "leave";
export type endGameState = "none" | "win" | "gameOver"
export interface ISelectMode {
	onButtonClick: g.Trigger<buttonID>;
	controller: controller;
}
export interface IUIInGame {
	getLayer(): { gameLayer: g.E, backgroundLayer: g.E };
	setEndGame(state: endGameState): void;
	cleanAndGotoMenu(): Promise<void>;
}
export interface IUILobby {
	showDialogJoinPvP(): void;
	setShowLoading(isShow: boolean): void;
	setShowReadySuccessAndWaitOther(isShow: boolean): void;
	startGamePvP(): void;
	setOnJoin(): void;
	test(): void;
}
export class render implements ISelectMode, IUILobby, IUIInGame {
	onButtonClick: Trigger<buttonID> = new Trigger;
	controller: controller;
	private layout: layout;
	private loadingContainer: g.E | undefined;
	private loadingWaitOtherContainer: g.E | undefined;
	private controllerContainer: g.E | undefined;
	private selectModeContainer: g.E | undefined;
	private endGameContainer: g.E | undefined;
	constructor(scene: g.Scene) {
		this.layout = new layout(scene);
		this.layout.appendToScene(scene);
		let bg = Helper.newSprite("/assets/background.png");
		this.layout.gameBgLayer.append(bg);

	}
	setOnJoin(): void {
		console.log('on joinn....');
	}
	setShowReadySuccessAndWaitOther(isShow: boolean): void {
		throw new Error("Method not implemented.");
	}
	async cleanAndGotoMenu() {
		this.setShowLoading(true);
		this.setEndGame("none");
		this.controller.layoutRoot.hide();
		await Helper.waitAsync(1000);
		this.setShowLoading(false);
	}
	getLayer(): { gameLayer: E; backgroundLayer: E; } {
		return {
			backgroundLayer: this.layout.gameBgLayer,
			gameLayer: this.layout.gameLayer
		}
	}

	startGamePvP(): void {
		console.log('ui start...');
		this.setShowLoading(false);
		//this.layout.gameBgLayer.hide();
		//this.selectModeContainer.hide();
		//this.controller.layoutRoot.show();
	}
	setShowLoading(isShow: boolean): void {
		if (this.loadingContainer == undefined) {
			const scene = this.layout.root.scene;
			let container = new g.E({
				scene: scene,
				local: true,
			});
			this.loadingContainer = container;
			let background = new g.FilledRect({
				scene: scene,
				parent: container,
				height: scene.game.height,
				width: scene.game.width,
				cssColor: "black",
				opacity: 0.85,
				touchable: true
			});
			let t = new al.Label({
				scene: scene,
				font: g.game.vars.font,
				fontSize: 40,
				width: 2000,
				x: scene.game.width / 2,
				y: scene.game.height / 2,
				textAlign: TextAlign.Left,
				lineBreak: true,
				widthAutoAdjust: true,
				parent: background,
				text: 'LOADING.....',
				textColor: 'white',
				anchorX: 0.5
			});
			this.layout.uiLayer.append(container);
		}
		if (isShow) {
			this.loadingContainer.show();
		} else {
			this.loadingContainer.hide();
		}
	}

	private createButtonMode(text: string, onclick: () => void) {
		const scene = g.game.scene();
		const bgAsset = scene.asset.getImage("/assets/ui/background-button.png");

		const myButton = new button9Patch({
			scene: scene,
			width: 400,
			height: 68,
			backgroundImage: bgAsset,
			sliceBorder: { top: 16, bottom: 16, left: 25, right: 55 },
			text: text,
			font: g.game.vars.font,
			textColor: "#FFFFFF",
			highlightColor: "#FFD700", //gold
			onClick: onclick
		});

		myButton.x = (g.game.width - myButton.width) / 2;
		myButton.y = 100;
		return myButton;
	}
	private createButtonJoinPvP(text: string, onclick: () => void) {
		const scene = g.game.scene();
		const bgAsset = scene.asset.getImage("/assets/ui/background-button.png");

		const myButton = new button9Patch({
			scene: scene,
			width: 250,
			height: 68,
			backgroundImage: bgAsset,
			sliceBorder: { top: 16, bottom: 16, left: 25, right: 55 },
			text: text,
			font: g.game.vars.font,
			textColor: "#FFFFFF",
			highlightColor: "#FFD700", //gold
			onClick: onclick
		});

		myButton.x = (g.game.width - myButton.width) / 2;
		myButton.y = 100;
		return myButton;
	}
	public showDialogJoinPvP() {
		const scene = this.layout.root.scene;
		let container = new g.E({
			scene: scene,
			local: true,
		});
		let background = new g.FilledRect({
			scene: scene,
			parent: container,
			height: scene.game.height,
			width: scene.game.width,
			cssColor: "black",
			opacity: 0.85,
			touchable: true
		});
		let t = new al.Label({
			scene: scene,
			font: g.game.vars.font,
			fontSize: 28,
			width: 2000,
			x: scene.game.width / 2,
			y: 100,
			textAlign: TextAlign.Left,
			lineBreak: true,
			widthAutoAdjust: true,
			parent: background,
			text: 'Please wait other player....',
			textColor: 'white',
			anchorX: 0.5
		});
		this.onButtonClick?.fire("readyCliked");

		this.layout.uiLayer.append(container);

	}
	public setEndGame(state: endGameState) {
		if (this.endGameContainer == undefined) {
			const scene = this.layout.root.scene;
			let container = new g.E({
				scene: scene,
				local: true,
			});
			this.endGameContainer = container;
			let background = new g.FilledRect({
				scene: scene,
				parent: container,
				height: scene.game.height,
				width: scene.game.width,
				cssColor: "black",
				opacity: 0.85,
				touchable: true
			});
			let t = new al.Label({
				scene: scene,
				local: true,
				tag: "label",
				font: g.game.vars.font,
				fontSize: 40,
				width: 2000,
				x: scene.game.width / 2,
				y: scene.game.height / 2,
				textAlign: TextAlign.Left,
				lineBreak: true,
				widthAutoAdjust: true,
				parent: background,
				text: "...",
				textColor: 'white',
				anchorX: 0.5
			});
			let btnCancel = this.createButtonJoinPvP("LEAVE", () => {
				console.log('goto main menu');
				this.onButtonClick.fire("leave");
			});
			btnCancel.y = scene.game.height / 2 + 100;
			container.append(btnCancel);
			this.layout.uiLayer.append(container);
		}

		if (state == "none") {
			this.endGameContainer.hide();
		} else {
			let find: g.E[] = [];
			Helper.findNodesByTag(this.layout.uiLayer, "label", find);
			let label = find[0] as al.Label
			label.text = state == "gameOver" ? "GameOver" : "You Win";
			label.invalidate()
			this.endGameContainer.show();
		}
	}
	public test() {
		console.log('tttt');
		const scene = g.game.scene();
		const bgAsset = scene.asset.getImage("/assets/ui/background-button.png");
		const myButton = new button9Patch({
			scene: scene,
			width: 400,
			height: 68,
			backgroundImage: bgAsset,
			sliceBorder: { top: 16, bottom: 16, left: 25, right: 55 },
			text: "test",
			font: g.game.vars.font,
			textColor: "#FFFFFF",
			highlightColor: "#FFD700", //gold
			onClick: () => {
				console.log('1122');
			}
		});

		myButton.x = (g.game.width - myButton.width) / 2;
		myButton.y = 100;
		this.layout.gameBgLayer.append(myButton)
		//

	}
}