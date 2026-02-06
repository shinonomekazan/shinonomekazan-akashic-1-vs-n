import { FlowManager } from "./flowManager";
import { FlowEventName } from "./eventName";
import { Vec2Like } from "@akashic-extension/collision-js";
import { render } from "../layout/render";
import { gameMode } from "../messageCode";
import { controlID } from "../layout/controller";
var senders: Map<FlowEventName, object>;
export function initialSender() {
	senders = new Map<FlowEventName, object>();
}
export function setSender(value: any, eventName?: FlowEventName) {
	if (eventName !== undefined) {
		senders.set(eventName, value);
	} else {
		senders.set(FlowManager.eventName, value);
	}
}
export function getSender(eventName: FlowEventName): any {
	return senders.get(eventName);
}