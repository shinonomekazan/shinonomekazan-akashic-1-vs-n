import { networkMessage } from "./RPCMessage";
import { eventNetworkRequestType, eventNetworkRoadcastType } from "./eventNetworkType";

export class networkBroadcaster {
	private eventTriggers: Map<string, g.Trigger<any>> = new Map();

	constructor(scene: g.Scene) {
		scene.onMessage.add(this.handleIncomingMessage, this);
	}

	public send(type: eventNetworkRequestType, payload: any = {}): void {
		const msg: networkMessage = { type, payload };
		g.game.raiseEvent(new g.MessageEvent(msg));
	}

	public on(eventName: eventNetworkRoadcastType): g.Trigger<any> {
		if (!this.eventTriggers.has(eventName)) {
			this.eventTriggers.set(eventName, new g.Trigger<any>());
		}
		return this.eventTriggers.get(eventName)!;
	}

	private handleIncomingMessage(e: g.MessageEvent): void {
		const msg = e.data as networkMessage;
		if (!msg || !msg.eventName) return;

		if (msg.payload && msg.payload.__targetId) {
			if (msg.payload.__targetId !== g.game.selfId) {
				return;
			}
		}

		const trigger = this.eventTriggers.get(msg.eventName);
		if (trigger) {
			trigger.fire(msg.payload);
		}
	}
}
