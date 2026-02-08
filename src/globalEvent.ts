export class globalEvent {
	trigger: g.Trigger<any>;
	constructor() {
		this.trigger = new g.Trigger();

		g.game.scene().onMessage.add((ev) => {
			if (ev.data && ev.data.type === "GLOBAL_ACTION") {
				this.trigger.fire(ev.data.payload);
			}
		});
	}

	fire(data: any) {
		g.game.raiseEvent(new g.MessageEvent({ type: "GLOBAL_ACTION", payload: data }));
	}
}

//const myEvent = new MyGlobalEvent();
//myEvent.trigger.add((data) => { /* Logic chạy ở mọi máy */ });
//myEvent.fire({ score: 10 }); // Gọi ở 1 máy, chạy ở tất cả máy