export interface BulletData {
	x: number;
	y: number;
	dx: number;
	dy: number;
	speed: number;
}

export class bulletModel {
	x: number;
	y: number;
	dx: number;
	dy: number;
	speed: number;
	isActive: boolean;
	radius: number;

	constructor(x: number, y: number, angle: number, speed: number) {
		this.x = x;
		this.y = y;
		this.speed = speed;
		this.isActive = true;
		this.radius = 5;

		const rad = angle * (Math.PI / 180);
		this.dx = Math.cos(rad) * this.speed;
		this.dy = Math.sin(rad) * this.speed;
	}

	update(screenWidth: number, screenHeight: number) {
		this.x += this.dx;
		this.y += this.dy;

		if (this.x < 0 || this.x > screenWidth || this.y < 0 || this.y > screenHeight) {
			this.isActive = false;
		}
	}

	getData(): BulletData {
		return {
			x: this.x,
			y: this.y,
			dx: this.dx,
			dy: this.dy,
			speed: this.speed
		};
	}
}
