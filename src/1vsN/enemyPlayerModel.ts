import { zombieModel } from "./zombieModel";

export class enemyPlayerModel {
	id: string;
	color: string;
	zombies: zombieModel[];

	spawnRate: number; 
	lastSpawnAge: number;
	spawnCount: number;

	constructor(id: string, color: string) {
		this.id = id;
		this.color = color;
		this.zombies = [];

		this.spawnRate = g.game.fps * 1;

		this.lastSpawnAge = -this.spawnRate;

		this.spawnCount = 0;
	}

	spawnZombie(x: number, y: number): boolean {
		const currentAge = g.game.age;

		if (currentAge - this.lastSpawnAge >= this.spawnRate) {
			const newZombie = new zombieModel(x, y, this.color, 4);
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
}
