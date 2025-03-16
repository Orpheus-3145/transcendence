import GameScene from '/app/src/Pages/Game/GameComponent/PhaserGame/Scenes/Game';


export default class Ball {
  private readonly radiusRatio: number;
	private readonly radius: number;
	private _graphic: Phaser.GameObjects.Circle;

	constructor(scene: GameScene, x: number, y: number) {

		this.radiusRatio = parseInt(import.meta.env.GAME_WIDTH) / parseInt(import.meta.env.GAME_BALL_RADIUS);
		this.radius = scene.scale.width / this.radiusRatio;

		// 0x0000ff
		// #808080
		// 0xD3D3D3
		this._graphic = scene.add.circle(x, y, this.radius, 0xffffff);
	}

	updatePosition(x: number, y: number): void {
		this._graphic.setPosition(x, y); // Update the ball's position
	}

	// Change the ball's color if needed
	setColor(color: number): void {
		this._graphic.setFillStyle(color, 1); // Update the fill style
	}
}
