import { NetworkMessage } from "./RPCMessage";
import { eventNetworkRequestType, eventNetworkRoadcastType } from "./eventNetwordType";

type RequestHandler = (payload: any, playerId: string) => any | Promise<any>;

export class NetworkServer {
	private handlers: Map<string, RequestHandler> = new Map();

	constructor(scene: g.Scene) {
		scene.onMessage.add(this.handleRequest, this);
	}

	/**
	 * Đăng ký xử lý RPC từ Client
	 */
	public onRpc(type: eventNetworkRequestType, handler: RequestHandler): void {
		this.handlers.set(type, handler);
	}

	/**
	 * Gửi Event xuống TẤT CẢ Client (Broadcast)
	 */
	public broadcast(eventName: eventNetworkRoadcastType, payload: any = {}): void {
		const msg: NetworkMessage = { eventName, payload };
		g.game.raiseEvent(new g.MessageEvent(msg));
	}

	/**
	 * Gửi Event xuống MỘT Client cụ thể
	 * Lưu ý: Akashic raiseEvent mặc định là broadcast, nên client phải tự lọc.
	 * Hàm này gửi kèm targetId trong payload để client tự check.
	 */
	public sendTo(targetPlayerId: string, eventName: eventNetworkRoadcastType, payload: any = {}): void {
		// Gói payload vào một cấu trúc chứa targetId
		this.broadcast(eventName, { ...payload, __targetId: targetPlayerId });
	}

	private handleRequest(e: g.MessageEvent): void {
		const req = e.data as NetworkMessage;

		// Chỉ xử lý nếu là RPC Request (có reqId và type)
		if (!req || !req.reqId || !req.type) return;

		const handler = this.handlers.get(req.type);
		if (!handler) return;

		Promise.resolve(handler(req.payload, e.player?.id))
			.then((result) => {
				const res: NetworkMessage = { reqId: req.reqId, payload: result };
				g.game.raiseEvent(new g.MessageEvent(res));
			})
			.catch((err) => {
				const res: NetworkMessage = { reqId: req.reqId, error: err.message };
				g.game.raiseEvent(new g.MessageEvent(res));
			});
	}
}