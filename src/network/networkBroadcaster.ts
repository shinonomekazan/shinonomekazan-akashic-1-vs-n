import { networkMessage } from "./RPCMessage";
import { eventNetworkRequestType, eventNetworkRoadcastType } from "./eventNetworkType";

export class networkBroadcaster {
	private eventTriggers: Map<string, g.Trigger<any>> = new Map();

	constructor(scene: g.Scene) {
		scene.onMessage.add(this.handleIncomingMessage, this);
		console.log("[networkBroadcaster] Initialized and listening for broadcasts.");
	}

	public send(type: eventNetworkRequestType, payload: any = {}): void {
		const msg: networkMessage = { type, payload };
		console.log(`[networkBroadcaster] Sending request: ${type} to Host`, payload);
		g.game.raiseEvent(new g.MessageEvent(msg));
	}

	public on(eventName: eventNetworkRoadcastType): g.Trigger<any> {
		if (!this.eventTriggers.has(eventName)) {
			this.eventTriggers.set(eventName, new g.Trigger<any>());
			console.log(`[networkBroadcaster] Created new trigger for event: ${eventName}`);
		}
		return this.eventTriggers.get(eventName)!;
	}

	private handleIncomingMessage(e: g.MessageEvent): void {
		const msg = e.data as networkMessage;
		if (!msg || !msg.eventName) return;

		// Check if the message is intended for this specific player
		if (msg.payload && msg.payload.__targetId) {
			if (msg.payload.__targetId !== g.game.selfId) {
				// Log ignored messages only if you need deep debugging, otherwise it's too spammy
				return;
			}
			console.log(`[networkBroadcaster] Received private message: ${msg.eventName}`);
		} else {
			console.log(`[networkBroadcaster] Received broadcast message: ${msg.eventName}`);
		}

		const trigger = this.eventTriggers.get(msg.eventName);
		if (trigger) {
			trigger.fire(msg.payload);
		} else {
			console.log(`[networkBroadcaster] Received event ${msg.eventName} but no listeners are registered.`);
		}
	}
}