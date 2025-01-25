import GameScene from '../Scenes/Game';


export default class Ball {
	private readonly radius: number;
	private _graphic: Phaser.GameObjects.Circle;

	constructor(scene: GameScene, x: number, y: number) {

		this.radius = scene.scale.width / (parseInt(import.meta.env.GAME_WIDTH) / parseInt(import.meta.env.GAME_BALL_RADIUS));
		this._graphic = scene.add.circle(x, y, this.radius, 0x0000ff);
	}

	private redraw(): void {
		// this._graphic.clear(); // Clear previous graphics
		this._graphic.fillStyle(0xff0000, 1); // Set the fill style (red in this case)
		this._graphic.fillCircle(0, 0, this.radius); // Draw the circle centered at (0, 0)
	}

	updatePosition(x: number, y: number): void {
		this._graphic.setPosition(x, y); // Update the ball's position
	}

	// Change the ball's color if needed
	setColor(color: number): void {
		this._graphic.setFillStyle(color, 1); // Update the fill style
	}
}
