// Loại tin nhắn gửi đi từ Client hoặc Server
export interface NetworkMessage {
	// Dành cho RPC (Request-Response)
	reqId?: string;       // Có ID => Là Request hoặc Response
	type?: string;        // Tên hành động RPC (chỉ có trong Request)

	// Dành cho Event (Server Push)
	eventName?: string;   // Có eventName => Là tin nhắn thông báo (Push)

	// Dữ liệu chung
	payload?: any;
	error?: string;
}