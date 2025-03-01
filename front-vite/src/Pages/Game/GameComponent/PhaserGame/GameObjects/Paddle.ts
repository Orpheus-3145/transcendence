import GameScene from '/app/src/Pages/Game/GameComponent/PhaserGame/Scenes/Game';


export default class Paddle {
	private _startPos: Phaser.Math.Vector2;
	private _graphic: Phaser.GameObjects.Rectangle;
	
	private readonly _width: number;
	private readonly _height: number;

	// @param scene: Phaser.Scene that contains the bar
	// @param x: x pos
	// @param y: y pos
	constructor(scene: GameScene, x: number, y: number) {
		this._startPos = new Phaser.Math.Vector2(x, y);

		const paddleWidthRatio = parseInt(import.meta.env.GAME_WIDTH) / parseInt(import.meta.env.GAME_PADDLE_WIDTH);
		const paddleHeightRatio = parseInt(import.meta.env.GAME_HEIGHT) / parseInt(import.meta.env.GAME_PADDLE_HEIGHT);	
		this._width = scene.scale.width / paddleWidthRatio;
		this._height = scene.scale.height / paddleHeightRatio;

		// Create a graphical rectangle to represent the player bar
		this._graphic = scene.add.rectangle(x, y, this._width, this._height, 0x0000ff).setOrigin(0, 0.5);
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
}
