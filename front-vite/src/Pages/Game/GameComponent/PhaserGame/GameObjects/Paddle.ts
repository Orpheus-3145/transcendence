import Resizable from './Resizable';
import GameScene from '/app/src/Pages/Game/GameComponent/PhaserGame/Scenes/Game';


export default class Paddle implements Resizable {
	private _startPos: Phaser.Math.Vector2;
	private _graphic: Phaser.GameObjects.Rectangle;
	private readonly scene: Phaser.Scene;
	
	private _width: number;
	private _height: number;

	// @param scene: Phaser.Scene that contains the bar
	// @param x: x pos
	// @param y: y pos
	constructor(scene: GameScene, x: number, y: number) {
		this.scene = scene;
		this._startPos = new Phaser.Math.Vector2(x, y);

		const paddleWidthRatio = parseInt(import.meta.env.GAME_WIDTH) / parseInt(import.meta.env.GAME_PADDLE_WIDTH);
		const paddleHeightRatio = parseInt(import.meta.env.GAME_HEIGHT) / parseInt(import.meta.env.GAME_PADDLE_HEIGHT);	

		this._width = this.scene.scale.width / paddleWidthRatio;
		this._height = this.scene.scale.height / paddleHeightRatio;

		// Create a graphical rectangle to represent the player bar
		this._graphic = this.scene.add.rectangle(x, y, this._width, this._height, 0xD3D3D3).setOrigin(0, 0.5);
	}

	// Update the position of the bar based on backend data
	updatePosition(y: number): void {
		this._graphic.y = y; // Set the y position from backend data
	}

	// Optionally, reset the position if you need to reset to the start position
	resetPos(): void {
		this._graphic.setPosition(this._startPos.x, this._startPos.y);
	}

	// Change the color of the paddle
	changeColor(color: number): void {
		this._graphic.setFillStyle(color, 1); // Set the new color using a hexadecimal color value
	}

	getColor(): number {
		return this._graphic.fillColor;
	}

	// Change the size of the paddle
	resizeShrink(): void {
		const newWidth = this._width;
		const newHeight = this._height / 2;
		this._graphic.setSize(newWidth, newHeight); // Update the internal size of the rectangle
		this._graphic.setDisplaySize(newWidth, newHeight); // Update the displayed size
	}

	resizeStretch(): void {
		const newWidth = this._width;
		const newHeight = this._height * 2;
		this._graphic.setSize(newWidth, newHeight); // Update the internal size of the rectangle
		this._graphic.setDisplaySize(newWidth, newHeight); // Update the displayed size
	}

	resizeOriginal(): void {
		this._graphic.setSize(this._width, this._height); // Update the internal size of the rectangle
		this._graphic.setDisplaySize(this._width, this._height); // Update the displayed size
	}

	resize(old_width: number, old_height: number): void {
    
    const w_ratio = this.scene.scale.width / old_width;
    const h_ratio = this.scene.scale.height / old_height;
		this._width *= w_ratio;
		this._height *= h_ratio;
		
    this._graphic.setPosition(this._graphic.x * w_ratio, this._graphic.y * h_ratio);
    this._graphic.setDisplaySize(this._width, this._height);
  }
}
