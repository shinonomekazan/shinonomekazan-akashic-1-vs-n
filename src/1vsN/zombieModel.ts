import { bossModel } from "./bossModel";

export interface ZombieData {
	x: number;
	y: number;
	speed: number;
	urlImage: string;
	// Nếu sau này zombie có HP > 1 hit, cần thêm hp: number vào đây
}

export class zombieModel {
	x: number;
	y: number;
	speed: number;
	damage: number;
	isActive: boolean;
	urlImg: string;

	constructor(spawnX: number, spawnY: number, color: string, speed: number) {
		this.x = spawnX;
		this.y = spawnY;
		this.urlImg = color;
		this.speed = speed;
		this.damage = 60;
		this.isActive = true;
	}

	update(boss: bossModel) {
		if (!this.isActive) return;

		const dx = boss.x - this.x;
		const dy = boss.y - this.y;
		const distance = Math.sqrt(dx * dx + dy * dy);

		if (distance < 30) {
			boss.takeDamage(this.damage);
			this.isActive = false;
			return;
		}

		if (distance > 0) {
			this.x += (dx / distance) * this.speed;
			this.y += (dy / distance) * this.speed;
		}
	}

	getData(): ZombieData {
		return {
			x: this.x,
			y: this.y,
			speed: this.speed,
			urlImage: this.urlImg // Map đúng property
		};
	}
}
