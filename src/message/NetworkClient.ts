import { NetworkMessage } from "./RPCMessage";
import { eventNetworkRequestType, eventNetworkRoadcastType } from "./eventNetwordType";

export class NetworkClient {
	private pendingRequests: Map<string, { resolve: Function, reject: Function }> = new Map();
	private eventTriggers: Map<string, g.Trigger<any>> = new Map();
	private timeoutMs: number;

	constructor(scene: g.Scene, timeoutMs: number = 5000) {
		console.log("[NetworkClient] Initialized.");
		this.timeoutMs = timeoutMs;
		scene.onMessage.add(this.handleIncomingMessage, this);
	}

	public request(type: eventNetworkRequestType, payload: any = {}): Promise<any> {
		return new Promise((resolve, reject) => {
			const reqId = `${g.game.selfId}_${g.game.age}_${Math.floor(g.game.localRandom.generate() * 100000)}`;

			console.log(`[NetworkClient] Sending RPC Request: "${type}" (ReqID: ${reqId})`);

			const timer = setTimeout(() => {
				if (this.pendingRequests.has(reqId)) {
					console.error(`[NetworkClient] RPC Timeout: "${type}" (ReqID: ${reqId})`);
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

		// Xử lý phản hồi RPC
		// Logic: msg có reqId và KHÔNG có type (là response), hoặc là message do chính mình gửi (để skip nếu cần, nhưng logic gốc đang gộp chung)
		if (msg.reqId && !msg.type || g.game.selfId == e.player.id) {
			const pending = this.pendingRequests.get(msg.reqId);
			if (pending) {
				if (msg.error) {
					console.error(`[NetworkClient] RPC Response Error (ReqID: ${msg.reqId}):`, msg.error);
					pending.reject(new Error(msg.error));
				} else {
					console.log(`[NetworkClient] RPC Response Success (ReqID: ${msg.reqId})`);
					pending.resolve(msg.payload);
				}
				this.pendingRequests.delete(msg.reqId);
			}
			return;
		}

		// Xử lý Broadcast Events
		if (msg.eventName) {
			// Logic check TargetId (client tự lọc)
			if (msg.payload && msg.payload.__targetId) {
				if (msg.payload.__targetId !== g.game.selfId) {
					// console.log(`[NetworkClient] Ignoring event "${msg.eventName}" meant for ${msg.payload.__targetId}`);
					return;
				}
			}

			const trigger = this.eventTriggers.get(msg.eventName);
			if (trigger) {
				console.log(`[NetworkClient] Received Event: "${msg.eventName}"`, msg.payload);
				trigger.fire(msg.payload);
			} else {
				// console.log(`[NetworkClient] No listener for event: "${msg.eventName}"`);
			}
		}
	}
}