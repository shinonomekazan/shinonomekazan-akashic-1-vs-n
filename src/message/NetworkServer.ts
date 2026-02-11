import { NetworkMessage } from "./RPCMessage";
import { eventNetworkRequestType, eventNetworkRoadcastType } from "./eventNetwordType";

type RequestHandler = (payload: any, playerId: string) => any | Promise<any>;

export class NetworkServer {
	private handlers: Map<string, RequestHandler> = new Map();

	constructor(scene: g.Scene) {
		console.log("[NetworkServer] Initialized.");
		scene.onMessage.add(this.handleRequest, this);
	}

	/**
	 * Đăng ký xử lý RPC từ Client
	 */
	public onRpc(type: eventNetworkRequestType, handler: RequestHandler): void {
		console.log(`[NetworkServer] Registered RPC handler for: "${type}"`);
		this.handlers.set(type, handler);
	}

	/**
	 * Gửi Event xuống TẤT CẢ Client (Broadcast)
	 */
	public broadcast(eventName: eventNetworkRoadcastType, payload: any = {}): void {
		console.log(`[NetworkServer] Broadcasting event: "${eventName}"`, payload);
		const msg: NetworkMessage = { eventName, payload };
		g.game.raiseEvent(new g.MessageEvent(msg));
	}

	/**
	 * Gửi Event xuống MỘT Client cụ thể
	 */
	public sendTo(targetPlayerId: string, eventName: eventNetworkRoadcastType, payload: any = {}): void {
		console.log(`[NetworkServer] Sending event: "${eventName}" to Target: ${targetPlayerId}`, payload);
		// Gói payload vào một cấu trúc chứa targetId
		this.broadcast(eventName, { ...payload, __targetId: targetPlayerId });
	}

	private handleRequest(e: g.MessageEvent): void {
		const req = e.data as NetworkMessage;

		// Chỉ xử lý nếu là RPC Request (có reqId và type)
		if (!req || !req.reqId || !req.type) return;

		const playerId = e.player?.id ?? "unknown";
		console.log(`[NetworkServer] Received RPC Request: "${req.type}" from Player: ${playerId} (ReqID: ${req.reqId})`);

		const handler = this.handlers.get(req.type);
		if (!handler) {
			console.warn(`[NetworkServer] No handler found for RPC: "${req.type}"`);
			return;
		}

		Promise.resolve(handler(req.payload, playerId))
			.then((result) => {
				console.log(`[NetworkServer] RPC "${req.type}" Success. Sending response (ReqID: ${req.reqId})`);
				const res: NetworkMessage = { reqId: req.reqId, payload: result };
				g.game.raiseEvent(new g.MessageEvent(res));
			})
			.catch((err) => {
				console.error(`[NetworkServer] RPC "${req.type}" Failed. Sending error (ReqID: ${req.reqId})`, err);
				const res: NetworkMessage = { reqId: req.reqId, error: err.message };
				g.game.raiseEvent(new g.MessageEvent(res));
			});
	}
}