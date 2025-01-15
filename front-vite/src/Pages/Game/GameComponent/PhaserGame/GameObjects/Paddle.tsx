import { GAME_PADDLE } from '../Game.data';
import Game from '../Scenes/Game';

export default class Paddle {
	private _startPos: Phaser.Math.Vector2;
	private _graphic: Phaser.GameObjects.Rectangle;

	private readonly _width: number = GAME_PADDLE.width;
	private readonly _height: number = GAME_PADDLE.height;

	// @param scene: Phaser.Scene that contains the bar
	// @param x: x pos
	// @param y: y pos
	constructor(scene: Game, x: number, y: number) {
		this._startPos = new Phaser.Math.Vector2(x, y);

		// Create a graphical rectangle to represent the player bar
		this._graphic = scene.add.rectangle(x, y, this._width, this._height, 0x0000ff);
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
}
