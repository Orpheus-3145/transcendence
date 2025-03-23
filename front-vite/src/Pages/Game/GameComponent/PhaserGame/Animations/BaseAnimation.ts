import Ball from "/app/src/Pages/Game/GameComponent/PhaserGame/GameObjects/Ball";
// Abstract class for background animations
export default abstract class BaseAnimation {
	protected scene: Phaser.Scene;
	protected _ball!: Ball;

	constructor(scene: Phaser.Scene) {
		this.scene = scene;
	}

	// Each animation type will implement its own start method
	abstract create(): void;

	// Each animation type will update itself
	abstract update(): void;

	// Clean up animations when switching or stopping
	abstract destroy(): void;


	protected createCircleTexture(key: string, radius: number): string {
		const graphics = this.scene.add.graphics();
		graphics.fillStyle(0xffffff, 1); // White color
		graphics.fillCircle(radius, radius, radius);
		graphics.generateTexture(key, radius, radius);
		graphics.destroy(); // Clean up

		return key;
    }

	setBall(ball: Ball): void {
		this._ball = ball;
	}
}
