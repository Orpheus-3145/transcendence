import TextWidget from '../GameObjects/TextWidget';
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

		new TextWidget(
			this,
			this.scale.width * 0.5,
			this.scale.height * 0.4,
			this._errorTrace,
			18,
			)

		// button for going home
		const goHomeButton = new TextWidget(
			this,
			this.scale.width * 0.9,
			this.scale.height * 0.9,
			'Home'
		)
		.setInteractive()
		.on('pointerover', () => goHomeButton.setStyle({ fill: '#FFA500' })) // Change color on hover
		.on('pointerout', () => goHomeButton.setStyle({ fill: '#fff' })) // Change color back when not hovered
		.on('pointerup', () => this.switchScene('MainMenu')); // Start the main game
	}
}
