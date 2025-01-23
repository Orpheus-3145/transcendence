import BaseScene from './Base';

export default class ErrorScene extends BaseScene {
	private _errorTrace: string = '';

	constructor() {
		super({ key: 'Error' });
	}

	init(data: { trace: string }): void {
		super.init()
		
		this._errorTrace = data.trace;
	}

  buildGraphicObjects(): void {

		this.add
			.text(this.scale.width * 0.5, this.scale.height * 0.4, `ERROR: ${this._errorTrace}`, {
				fontSize: `${Math.round(this._textFontRatio * this.scale.width) + 18}px`,
				align: 'center',
				color: '#0f0',
			})
			.setOrigin(0.5, 0.5);

		// button for going home
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
}
