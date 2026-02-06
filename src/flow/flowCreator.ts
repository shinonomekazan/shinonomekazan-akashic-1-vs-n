import { renderLogicStep } from "../layout/renderLogicStep";
import { FlowEventName } from "./eventName";
import { FlowManager } from "./flowManager";
import { Flow, WaitFrameStep, BaseStep } from "./step";

export class FlowCreator {
	private _manager: FlowManager;
	constructor(
		manager: FlowManager,
	) {
		this._manager = manager;

		this._manager.addFlow(new Flow(FlowEventName.Init, [
			,
		]));
	}
}