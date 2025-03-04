import BaseScene from '/app/src/Pages/Game/GameComponent/PhaserGame/Scenes/Base';

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
		super.buildGraphicObjects();

		this.add
			.text(this.scale.width * 0.5, this.scale.height * 0.4, this._errorTrace, {
				fontSize: `${Math.round(this._textFontRatio * this.scale.width) + 18}px`,
				align: 'center',
				color: '#f00',
				wordWrap: { 
					width: this.scale.width * 0.5,
				},
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
