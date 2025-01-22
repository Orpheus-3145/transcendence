import { GAME_BALL } from '../Game.data';
import GameScene from '../Scenes/GameScene';

export default class Ball {
	private readonly radius: number = GAME_BALL.radius;
	private _graphic: Phaser.GameObjects.Circle;

	constructor(scene: GameScene, x: number, y: number) {
		this._graphic = scene.add.circle(x, y, this.radius, 0x0000ff);
	}

	// Redraw the ball
	private redraw(): void {
		// this._graphic.clear(); // Clear previous graphics
		this._graphic.fillStyle(0xff0000, 1); // Set the fill style (red in this case)
		this._graphic.fillCircle(0, 0, this.radius); // Draw the circle centered at (0, 0)
	}

	// Update the ball's position
	updatePosition(x: number, y: number): void {
		this._graphic.setPosition(x, y); // Update the ball's position
	}

	// Change the ball's color if needed
	setColor(color: number): void {
		this._graphic.setFillStyle(color, 1); // Update the fill style
	}
}
