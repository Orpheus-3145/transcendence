import { GAME } from "../Game.data";

export default class Error extends Phaser.Scene {

	// error info
	private _errorData: string = '';

	constructor () {
	super({ key: 'Error' });
	}

	// executed when scene.start('Error') is called,
	// @param trace: information about the error
	init( data: {trace: string}): void {
	this._errorData = data.trace
	}

	// loading graphic assets, fired after init()
	preload(): void {

	}


	// run after preload(), shows a basic info of the error
	create(): void {

		this.add.text(GAME.width / 2, 100, `ERROR: ${this._errorData}`, {
				fontSize: '50px',
				align: 'center',
				color: '#0f0',
			}).setOrigin(0.5, 0.5);

		// button for going home
		const goHomeButton = this.add.text(GAME.width - 150, GAME.height - 100, 'Home', {
			fontSize: '32px',
			align: 'center',
			color: '#fff',
		}).setInteractive();
		// Change color on hover
		goHomeButton.on('pointerover', () => goHomeButton.setStyle({ fill: '#ff0' }));
		// Change color back when not hovered
		goHomeButton.on('pointerout', () => goHomeButton.setStyle({ fill: '#fff' }));
		// Start the main game
		goHomeButton.on('pointerup', () => this.scene.start('MainMenu'));
	}

	// run every frame update
	upload(): void {}
};
