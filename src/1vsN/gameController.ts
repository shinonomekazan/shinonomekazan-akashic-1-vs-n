import { Helper } from "../helper";
import { bossModel, BossData } from "./bossModel";
import { enemyPlayerModel, EnemyPlayerData } from "./enemyPlayerModel";

export interface GameSnapshotData {
	bossPlayerId: string;
	boss: BossData;
	players: EnemyPlayerData[];
	timestamp: number;
	remainingTime: number;
	isGameOver: boolean;
	winner: string | null;
}

export class gameController {
	boss: bossModel | null;
	enemyPlayers: Map<string, enemyPlayerModel>;
	bossPlayerId: string;
	selfId: string;
	screenWidth: number;
	screenHeight: number;
	remainingTime: number;
	maxTime: number;
	isGameOver: boolean;
	winner: string | null; // 'boss' | 'players'

	constructor(bossPlayerId: string, screenWidth: number, screenHeight: number, selfId: string) {
		this.bossPlayerId = bossPlayerId;
		this.selfId = selfId;
		this.screenWidth = screenWidth;
		this.screenHeight = screenHeight;
		this.enemyPlayers = new Map();
		this.maxTime = 60;
		this.remainingTime = this.maxTime;
		this.isGameOver = false;
		this.winner = null;

		this.boss = new bossModel(bossPlayerId, screenWidth / 2, screenHeight / 2, 100, 0.3);
	}

	addPlayer(playerId: string, imgUrl: string) {
		if (playerId === this.bossPlayerId) return;
		if (!this.enemyPlayers.has(playerId)) {
			this.enemyPlayers.set(playerId, new enemyPlayerModel(playerId, imgUrl));
		}
	}

	removePlayer(playerId: string) {
		if (this.enemyPlayers.has(playerId)) {
			this.enemyPlayers.delete(playerId);
		}
	}

	handleInput(playerId: string, pointX: number, pointY: number) {
		if (this.isGameOver) return;

		if (!this.boss || this.boss.isDead()) {
			return;
		}
		if (playerId === this.bossPlayerId) {
			this.boss.setAim(pointX, pointY);
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
		if (this.isGameOver) return;
		if (!this.boss) return;

		if (this.remainingTime > 0) {
			this.remainingTime -= 1 / g.game.fps;
			if (this.remainingTime <= 0) {
				this.remainingTime = 0;
				this.finishGame('boss');
				return;
			}
		}

		if (this.boss.isDead()) {
			this.finishGame('players');
			return;
		}

		this.boss.shoot();
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

	finishGame(winner: string) {
		this.isGameOver = true;
		this.winner = winner;
	}

	reset() {
		this.remainingTime = this.maxTime;
		this.isGameOver = false;
		this.winner = null;

		if (this.boss) {
			this.boss.hp = this.boss.maxHp;
			this.boss.bullets = [];
			this.boss.killCount = 0;
			this.boss.x = this.screenWidth / 2;
			this.boss.y = this.screenHeight / 2;
			this.boss.angle = 0;
		}

		this.enemyPlayers.forEach(p => {
			p.zombies = [];
			p.spawnCount = 0;
			p.lastSpawnAge = -p.spawnRate;
		});
	}

	getSnapshot(): GameSnapshotData {
		return {
			bossPlayerId: this.bossPlayerId,
			boss: this.boss ? this.boss.getData() : null,
			players: Array.from(this.enemyPlayers.values()).map(p => p.getData()),
			timestamp: g.game.age,
			remainingTime: this.remainingTime,
			isGameOver: this.isGameOver,
			winner: this.winner
		};
	}

	initFromSnapshot(snapshot: GameSnapshotData) {
		if (!snapshot) return;

		this.bossPlayerId = snapshot.bossPlayerId;
		this.remainingTime = snapshot.remainingTime;
		this.isGameOver = snapshot.isGameOver;
		this.winner = snapshot.winner;

		if (snapshot.boss) {
			if (!this.boss) {
				this.boss = new bossModel(snapshot.boss.id, this.screenWidth / 2, this.screenHeight / 2, snapshot.boss.hp, 0.3);
			}
			this.boss.restore(snapshot.boss);
		}

		snapshot.players.forEach(pData => {
			let player = this.enemyPlayers.get(pData.id);
			if (!player) {
				player = new enemyPlayerModel(pData.id, pData.urlImage);
				this.enemyPlayers.set(pData.id, player);
			}
			player.restore(pData);
		});
	}
}
