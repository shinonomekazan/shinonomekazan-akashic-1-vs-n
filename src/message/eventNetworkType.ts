export type eventNetworkRequestType =
	"join_room" |
	"destroy" |
	"restart"
export type eventNetworkRoadcastType =
	"player_joined" |
	"time_updated" |
	"restart_game"
export function plainToClass<T>(ClassSymbol: new () => T, plainData: any): T {
	const instance = new ClassSymbol();
	if (plainData && typeof plainData === 'object') {
		Object.assign(instance, plainData);
	}
	return instance;
}
export class joinRoomData {
	id: string;
	bossId: string;
	noBossIds: string[];
	name: string;
	imgUrlIndex: number;
	constructor(data?: Partial<joinRoomData>) {
		if (data) {
			Object.assign(this, data);
		}
	}
	clientSet(name: string) {
		this.name = name;
	}
	serverSet(id: string, bossId: string, noBossIds: string[], colorIndex: number) {
		this.id = id;
		this.bossId = bossId;
		this.noBossIds = noBossIds;
		this.imgUrlIndex = colorIndex;
	}
}
