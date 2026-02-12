import { networkMessage } from "./RPCMessage";
import { eventNetworkRequestType, eventNetworkRoadcastType } from "./eventNetworkType";

type RequestHandler = (payload: any, playerId: string) => void;

export class networkHost {
	private handlers: Map<string, RequestHandler> = new Map();

	constructor(scene: g.Scene) {
		scene.onMessage.add(this.handleRequest, this);
	}

	public on(type: eventNetworkRequestType, handler: RequestHandler): void {
		this.handlers.set(type, handler);
	}

	public broadcast(eventName: eventNetworkRoadcastType, payload: any = {}): void {
		const msg: networkMessage = { eventName, payload };
		g.game.raiseEvent(new g.MessageEvent(msg));
	}

	public sendTo(targetPlayerId: string, eventName: eventNetworkRoadcastType, payload: any = {}): void {
		this.broadcast(eventName, { ...payload, __targetId: targetPlayerId });
	}

	private handleRequest(e: g.MessageEvent): void {
		const req = e.data as networkMessage;

		if (!req || !req.type) return;

		const playerId = e.player?.id ?? "unknown";

		const handler = this.handlers.get(req.type);
		if (handler) {
			handler(req.payload, playerId);
		}
	}
}
