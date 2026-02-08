import { NetworkMessage } from "./RPCMessage";
import { eventNetworkRequestType, eventNetworkRoadcastType } from "./eventNetwordType";

export class NetworkClient {
	private pendingRequests: Map<string, { resolve: Function, reject: Function }> = new Map();
	private eventTriggers: Map<string, g.Trigger<any>> = new Map();
	private timeoutMs: number;

	constructor(scene: g.Scene, timeoutMs: number = 5000) {
		this.timeoutMs = timeoutMs;
		scene.onMessage.add(this.handleIncomingMessage, this);
	}

	public request(type: eventNetworkRequestType, payload: any = {}): Promise<any> {
		return new Promise((resolve, reject) => {
			const reqId = `${g.game.age}_${Math.floor(g.game.localRandom.generate() * 100000)}`;

			const timer = setTimeout(() => {
				if (this.pendingRequests.has(reqId)) {
					this.pendingRequests.delete(reqId);
					reject(new Error(`Request timeout: ${type}`));
				}
			}, this.timeoutMs);

			this.pendingRequests.set(reqId, {
				resolve: (data: any) => { clearTimeout(timer); resolve(data); },
				reject: (err: any) => { clearTimeout(timer); reject(err); }
			});

			const msg: NetworkMessage = { reqId, type, payload };
			g.game.raiseEvent(new g.MessageEvent(msg));
		});
	}

	public on(eventName: eventNetworkRoadcastType): g.Trigger<any> {
		if (!this.eventTriggers.has(eventName)) {
			this.eventTriggers.set(eventName, new g.Trigger<any>());
		}
		return this.eventTriggers.get(eventName)!;
	}

	private handleIncomingMessage(e: g.MessageEvent): void {
		const msg = e.data as NetworkMessage;
		if (!msg) return;

		if (msg.reqId && !msg.type || g.game.selfId == e.player.id) {
			const pending = this.pendingRequests.get(msg.reqId);
			if (pending) {
				if (msg.error) pending.reject(new Error(msg.error));
				else pending.resolve(msg.payload);
				this.pendingRequests.delete(msg.reqId);
			}
			return;
		}

		if (msg.eventName) {
			const trigger = this.eventTriggers.get(msg.eventName);
			if (trigger) {
				trigger.fire(msg.payload);
			}
		}
	}
}