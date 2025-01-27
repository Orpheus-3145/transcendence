
import { GameMode, InitData } from '../Types/types';
import BaseScene from './Base';

export default class ResultsScene extends BaseScene {

	private _winner!: string;
	private _nextGameData!: InitData;

	constructor() {
		super({ key: 'Results' });
	}

	// fired then scene.start('Results') is called, sets the id
	init(data: { winner: string, nextGameData: InitData }): void {
		super.init();
		
		this._winner = data.winner;
		this._nextGameData = data.nextGameData
	}

	buildGraphicObjects(): void {
		super.buildGraphicObjects();

		this.add
		.text(this.scale.width * 0.5, this.scale.height * 0.2, `Player ${this._winner} won!`, {
			fontSize: `${Math.round(this._textFontRatio * this.scale.width) + 50}px`,
			align: 'center',
			color: '#0f0',
			wordWrap: { 
				width: this.scale.width * 0.5,
			},
		})
		.setOrigin(0.5, 0.5);
		
		if (this._nextGameData.mode === GameMode.single) {
			
			const playAgainBtn = this.add
			.text(this.scale.width * 0.5, this.scale.height * 0.4, 'Play again', {
				fontSize: `${Math.round(this._textFontRatio * this.scale.width)}px`,
				align: 'center',
				color: '#fff',
			})
			.setOrigin(0.5, 0.5)
			.setInteractive()
			.on('pointerover', () => playAgainBtn.setStyle({ fill: '#ff0' }))	// Change color on hover
			.on('pointerout', () => playAgainBtn.setStyle({ fill: '#fff' }))
			.on('pointerup', () => this.switchScene('Game', this._nextGameData));
		}

		const goHomeButton = this.add
		.text(this.scale.width * 0.9, this.scale.height * 0.9, 'Home', {
			fontSize: `${Math.round(this._textFontRatio * this.scale.width)}px`,
			align: 'center',
			color: '#fff',
		})
		.setOrigin(0.5, 0.5)
		.setInteractive()
		.on('pointerover', () => goHomeButton.setStyle({ fill: '#ff0' })) 	// Change color on hover
		.on('pointerout', () => goHomeButton.setStyle({ fill: '#fff' })) 		// Change color back when not hovered
		.on('pointerup', () => this.switchScene('MainMenu')); 							// Start the main game
	}
}
