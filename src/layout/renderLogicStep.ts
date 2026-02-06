import { FlowEventName } from "../flow/eventName";
import { BaseStep } from "../flow/step";
import { getSender } from "../flow/sender";
import { IUIInGame, IUILobby } from "./render";

export class renderLogicStep implements BaseStep {
	private renderLobby: IUILobby;
	private renderInGame: IUIInGame;
	async onStep(eventName: FlowEventName): Promise<void> {
		switch (eventName) {
			case FlowEventName.Init:
				{
					
				}
				break;
			
			default:
				console.error("renderLogicStep: unknown event: ", FlowEventName[eventName]);
		}
	}
}