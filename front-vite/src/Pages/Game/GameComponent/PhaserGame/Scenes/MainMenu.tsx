import { GAME } from '../Game.data';
import { v4 as uuidv4 } from 'uuid';

import * as GameTypes from '../Types/types';

export default class MainMenu extends Phaser.Scene {
	// background texture
	private _background!: Phaser.GameObjects.Image;

	constructor() {
		super({ key: 'MainMenu' });
	}

	// scene.start('MainMenu') is called,
	init(): void {}

	// loading graphic assets, fired after init()
	preload(): void {
		this.load.image('background', GAME.background);
	}

	// run after preload(), creation of the elements of the menu
	create(): void {
		// sets the background
		this._background = this.add.image(GAME.width / 2, GAME.height / 2, 'background');
		this._background.setDisplaySize(this.scale.width, this.scale.height);

		this.createBtn(400, 100, 'Play [single player]').on('pointerup', () =>
			this.scene.start('Game', { sessionToken: uuidv4(), mode: GameTypes.GameMode.single }),
		);
		this.createBtn(400, 150, 'Play [multi player]').on('pointerup', () =>
			this.scene.start('Matchmaking'),
		);
		this.createBtn(400, 200, 'Settings').on('pointerup', () => this.scene.start('Settings'));
	}

	// run every frame update
	update(): void {}

	createBtn(x: number, y: number, content: string): Phaser.GameObjects.Text {
		const newBtn = this.add
			.text(x, y, content, {
				fontSize: '32px',
				align: 'center',
				color: '#fff',
			})
			.setInteractive();

		// Change color on hover
		newBtn.on('pointerover', () => newBtn.setStyle({ fill: '#ff0' }));
		// Change color back when not hovered
		newBtn.on('pointerout', () => newBtn.setStyle({ fill: '#fff' }));
		// goes to settings
		return newBtn;
	}
}
