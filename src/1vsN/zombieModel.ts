import { bossModel } from "./bossModel";

export class zombieModel {
	x: number;
	y: number;
	speed: number;
	damage: number;
	isActive: boolean;
	color: string;
	constructor(spawnX: number, spawnY: number, color: string, speed: number) {
		this.x = spawnX;
		this.y = spawnY;
		this.color = color;
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
}