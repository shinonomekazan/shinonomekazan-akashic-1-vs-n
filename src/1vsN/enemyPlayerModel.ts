import { zombieModel, ZombieData } from "./zombieModel";

export interface EnemyPlayerData {
	id: string;
	urlImage: string; // Sửa tên biến cho đúng chuẩn
	spawnCount: number;
	lastSpawnAge: number; // QUAN TRỌNG: Để đồng bộ cooldown spawn zombie
	zombies: ZombieData[];
}

export class enemyPlayerModel {
	id: string;
	urlImage: string;
	zombies: zombieModel[];

	spawnRate: number;
	lastSpawnAge: number;
	spawnCount: number;

	constructor(id: string, urlImage: string) {
		this.id = id;
		this.urlImage = urlImage;
		this.zombies = [];

		this.spawnRate = g.game.fps * 1;

		this.lastSpawnAge = -this.spawnRate;

		this.spawnCount = 0;
	}

	spawnZombie(x: number, y: number): boolean {
		const currentAge = g.game.age;

		if (currentAge - this.lastSpawnAge >= this.spawnRate) {
			const newZombie = new zombieModel(x, y, this.urlImage, 4);
			this.zombies.push(newZombie);

			this.lastSpawnAge = currentAge;
			this.spawnCount++;
			return true;
		}
		return false;
	}

	getCooldownRemaining(): number {
		const currentAge = g.game.age;
		const framesPassed = currentAge - this.lastSpawnAge;

		if (framesPassed >= this.spawnRate) return 0;

		const framesRemaining = this.spawnRate - framesPassed;
		const secondsRemaining = framesRemaining / g.game.fps;

		return Math.ceil(secondsRemaining * 10) / 10;
	}

	cleanup() {
		this.zombies = this.zombies.filter(z => z.isActive);
	}

	getData(): EnemyPlayerData {
		return {
			id: this.id,
			urlImage: this.urlImage,
			spawnCount: this.spawnCount,
			lastSpawnAge: this.lastSpawnAge,
			zombies: this.zombies.map(z => z.getData())
		};
	}

	restore(data: EnemyPlayerData) {
		this.id = data.id;
		this.urlImage = data.urlImage; // Restore url ảnh
		this.spawnCount = data.spawnCount;
		this.lastSpawnAge = data.lastSpawnAge; // Restore cooldown

		this.zombies = data.zombies.map(zData => {
			const z = new zombieModel(zData.x, zData.y, zData.urlImage, zData.speed);
			// Nếu zombie có logic HP/Active phức tạp hơn thì cần restore thêm ở đây
			return z;
		});
	}
}
