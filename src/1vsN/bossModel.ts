import { bulletModel } from "./bulletModel";

export class bossModel {
	id: string;
	hp: number;
	maxHp: number;
	fireRate: number;
	angle: number;
	x: number;
	y: number;

	bullets: bulletModel[];
	lastShotAge: number;
	bulletSpeed: number;
	killCount: number;

	constructor(id: string, x: number, y: number, hp: number, fireRateSeconds: number) {
		this.id = id;
		this.x = x;
		this.y = y;
		this.hp = hp;
		this.maxHp = hp;

		this.fireRate = Math.floor(g.game.fps * fireRateSeconds);

		this.angle = 0;
		this.bullets = [];

		this.lastShotAge = -this.fireRate;

		this.bulletSpeed = 15;
		this.killCount = 0;
	}

	setAim(targetX: number, targetY: number) {
		const dx = targetX - this.x;
		const dy = targetY - this.y;
		this.angle = Math.atan2(dy, dx) * (180 / Math.PI);
	}

	shoot() {
		const currentAge = g.game.age;

		if (currentAge - this.lastShotAge >= this.fireRate) {
			const bullet = new bulletModel(this.x, this.y, this.angle, this.bulletSpeed);
			this.bullets.push(bullet);
			this.lastShotAge = currentAge;
		}
	}

	updateBullets(screenWidth: number, screenHeight: number) {
		this.bullets.forEach(b => b.update(screenWidth, screenHeight));
		this.bullets = this.bullets.filter(b => b.isActive);
	}

	takeDamage(amount: number) {
		this.hp = Math.max(0, this.hp - amount);
	}

	addScore() {
		this.killCount++;
	}

	isDead(): boolean {
		return this.hp <= 0;
	}
}
