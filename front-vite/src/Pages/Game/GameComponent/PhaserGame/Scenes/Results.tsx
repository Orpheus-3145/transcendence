import { GAME } from '../Game.data';

class Results extends Phaser.Scene {
	// id of the winner of the game
	private _idWinner: string = '';

	constructor() {
		super({ key: 'Results' });
	}

	// fired then scene.start('Results') is called, sets the id
	init(data: { idWinner: string }): void {
		this._idWinner = data.idWinner;
	}

	// loading graphic assets, fired after init()
	preload(): void {}

	// run after preload(), shows a basic info of the error
	create(): void {
		this.add
			.text(GAME.width / 2, 40, `Player: ${this._idWinner} won!`, {
				fontSize: '50px',
				align: 'center',
				color: '#0f0',
			})
			.setOrigin(0.5, 0.5);

		// button for going home
		const goHomeButton = this.add
			.text(GAME.width - 150, GAME.height - 100, 'Home', {
				fontSize: '32px',
				align: 'center',
				color: '#fff',
			})
			.setInteractive();
		// Change color on hover
		goHomeButton.on('pointerover', () => goHomeButton.setStyle({ fill: '#ff0' }));
		// Change color back when not hovered
		goHomeButton.on('pointerout', () => goHomeButton.setStyle({ fill: '#fff' }));
		// Start the main game
		goHomeButton.on('pointerup', () => this.scene.start('MainMenu'));
	}

	// run every frame update
	update(): void {}
}

export default Results;
