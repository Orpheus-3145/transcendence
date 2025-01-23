import { GAME } from '../Game.data';
import BaseScene from './Base';

export default class ResultsScene extends BaseScene {
	// id of the winner of the game
	private _winner: string = '';

	constructor() {
		super({ key: 'Results' });
	}

	// fired then scene.start('Results') is called, sets the id
	init(data: { winner: string }): void {
		super.init();
	
		this._winner = data.winner;
	}

	buildGraphicObjects(): void {
		this.add
			.text(this.scale.width * 0.5, this.scale.height * 0.1, `Player: ${this._winner} won!`, {
				fontSize: `${Math.round(this._textFontRatio * this.scale.width) + 50}px`,
				align: 'center',
				color: '#0f0',
			})
			.setOrigin(0.5, 0.5);

			const goHomeButton = this.add
			.text(this.scale.width * 0.9, this.scale.height * 0.9, 'Home', {
				fontSize: `${Math.round(this._textFontRatio * this.scale.width)}px`,
				align: 'center',
				color: '#fff',
			})
			.setOrigin(0.5, 0.5)
			.setInteractive()
			.on('pointerover', () => goHomeButton.setStyle({ fill: '#ff0' })) // Change color on hover
			.on('pointerout', () => goHomeButton.setStyle({ fill: '#fff' })) // Change color back when not hovered
			.on('pointerup', () => this.switchScene('MainMenu')); // Start the main game
	}

	// run every frame update
	update(): void {}
}
