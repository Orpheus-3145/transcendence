import Resizable from './Resizable';

export default class Ball implements Resizable{
  private readonly radiusRatio: number;
	private readonly scene: Phaser.Scene;
	private radius: number;
	private _graphic: Phaser.GameObjects.Arc;

	constructor(scene: Phaser.Scene, x: number, y: number) {

		this.scene = scene;
		this.radiusRatio = parseInt(import.meta.env.GAME_WIDTH) / parseInt(import.meta.env.GAME_BALL_RADIUS);
		this.radius = this.scene.scale.width / this.radiusRatio;

		this._graphic = this.scene.add.circle(x, y, this.radius, 0xffffff);
	}

	updatePosition(x: number, y: number): void {
		this._graphic.setPosition(x, y); // Update the ball's position
	}

	// Change the ball's color if needed
	setColor(color: number): void {
		this._graphic.setFillStyle(color, 1); // Update the fill style
	}

	getPos(): {x: number, y: number} {
		return {x: this._graphic.x, y: this._graphic.y};
	}

	resize(old_width: number, old_height: number): void {
		
		const w_ratio = this.scene.scale.width / old_width;
		const h_ratio = this.scene.scale.height / old_height;
			
			this.radius = this.scene.scale.width / this.radiusRatio;
		this._graphic.setPosition(this._graphic.x * w_ratio, this._graphic.y * h_ratio);
			this._graphic.setRadius(this.radius);
	}

	show(): void {
		this._graphic.setVisible(true);
	}

	hide(): void {
		this._graphic.setVisible(false);
		}
}
