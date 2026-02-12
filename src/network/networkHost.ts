import { networkMessage } from "./RPCMessage";
import { eventNetworkRequestType, eventNetworkRoadcastType } from "./eventNetworkType";

type RequestHandler = (payload: any, playerId: string) => void;

export class networkHost {
	private handlers: Map<string, RequestHandler> = new Map();

	constructor(scene: g.Scene) {
		scene.onMessage.add(this.handleRequest, this);
		console.log("[networkHost] Initialized and listening for messages.");
	}

	public on(type: eventNetworkRequestType, handler: RequestHandler): void {
		this.handlers.set(type, handler);
		console.log(`[networkHost] Registered handler for request type: ${type}`);
	}

	public broadcast(eventName: eventNetworkRoadcastType, payload: any = {}): void {
		const msg: networkMessage = { eventName, payload };
		console.log(`[networkHost] Broadcasting event: ${eventName}`, payload);
		g.game.raiseEvent(new g.MessageEvent(msg));
	}

	public sendTo(targetPlayerId: string, eventName: eventNetworkRoadcastType, payload: any = {}): void {
		console.log(`[networkHost] Sending event: ${eventName} to player: ${targetPlayerId}`, payload);
		this.broadcast(eventName, { ...payload, __targetId: targetPlayerId });
	}

	private handleRequest(e: g.MessageEvent): void {
		const req = e.data as networkMessage;

		if (!req || !req.type) return;

		const playerId = e.player?.id ?? "unknown";
		console.log(`[networkHost] Received request: ${req.type} from player: ${playerId}`, req.payload);

		const handler = this.handlers.get(req.type);
		if (handler) {
			handler(req.payload, playerId);
		} else {
			console.error(`[networkHost] No handler found for request type: ${req.type}`);
		}
	}
}