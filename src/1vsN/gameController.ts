import { Helper } from "../helper";
import { bossModel } from "./bossModel";
import { enemyPlayerModel } from "./enemyPlayerModel";

export class gameController {
	boss: bossModel | null;
	enemyPlayers: Map<string, enemyPlayerModel>;
	bossPlayerId: string;
	selfId: string;
	screenWidth: number;
	screenHeight: number;

	constructor(bossPlayerId: string, screenWidth: number, screenHeight: number, selfId: string) {
		this.bossPlayerId = bossPlayerId;
		this.selfId = selfId;
		this.screenWidth = screenWidth;
		this.screenHeight = screenHeight;
		this.enemyPlayers = new Map();

		this.boss = new bossModel(bossPlayerId, screenWidth / 2, screenHeight / 2, 100, 0.3);
	}

	addPlayer(playerId: string, imgUrl: string) {
		if (playerId === this.bossPlayerId) return;
		if (!this.enemyPlayers.has(playerId)) {
			console.log(`Enemy player ${playerId} joined`);
			this.enemyPlayers.set(playerId, new enemyPlayerModel(playerId, imgUrl));
		}
	}

	removePlayer(playerId: string) {
		if (this.enemyPlayers.has(playerId)) {
			this.enemyPlayers.delete(playerId);
		}
	}

	handleInput(playerId: string, pointX: number, pointY: number) {
		if (this.boss.isDead()) {
			return;
		}
		if (playerId === this.bossPlayerId && this.boss) {
			this.boss.setAim(pointX, pointY);
			this.boss.shoot();
			return;
		}
		let newPoint = Helper.snapToScreenEdge(pointX, pointY);
		pointX = newPoint.x;
		pointY = newPoint.y;
		let enemy = this.enemyPlayers.get(playerId);
		if (!enemy) return;

		enemy.spawnZombie(pointX, pointY);
	}

	update() {
		if (!this.boss || this.boss.isDead()) return;

		this.boss.updateBullets(this.screenWidth, this.screenHeight);

		this.enemyPlayers.forEach(player => {
			player.zombies.forEach(zombie => {
				zombie.update(this.boss!);

				if (zombie.isActive) {
					for (const bullet of this.boss!.bullets) {
						if (!bullet.isActive) continue;

						const distSq = (bullet.x - zombie.x) ** 2 + (bullet.y - zombie.y) ** 2;
						const hitRadius = (bullet.radius + 10) ** 2;

						if (distSq < hitRadius) {
							zombie.isActive = false;
							bullet.isActive = false;
							this.boss!.addScore();
							break;
						}
					}
				}
			});
			player.cleanup();
		});
	}
}
