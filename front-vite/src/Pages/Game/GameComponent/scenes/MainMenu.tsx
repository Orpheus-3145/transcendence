import { Scene } from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../GameData'

export default class MainMenu extends Scene
{
	background: Phaser.GameObjects.Image = null!;
	
	constructor () {
		super({ key: 'MainMenu' });
	}

	preload() {
		this.load.image('background', '/assets/texture/background.png')
	}

	create () {
		this.background = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'background');
		this.background.setDisplaySize(this.scale.width, this.scale.height);

		const singlePlayerButton = this.add.text(400, 100, 'Play [single player]', {
			fontSize: '32px',
			align: 'center',
			color: '#fff',
		}).setInteractive();
		singlePlayerButton.on('pointerover', () => {
			singlePlayerButton.setStyle({ fill: '#ff0' }); // Change color on hover
		});
		singlePlayerButton.on('pointerout', () => {
			singlePlayerButton.setStyle({ fill: '#fff' }); // Change color back when not hovered
		});
		singlePlayerButton.on('pointerup', () => { // Handle click events
			this.scene.start('Game'); // Start the main game scene
		});

		const multiPlayerButton = this.add.text(400, 150, 'Play [multi player]', {
			fontSize: '32px',
			align: 'center',
			color: '#fff',
		}).setInteractive();
		multiPlayerButton.on('pointerover', () => {
			multiPlayerButton.setStyle({ fill: '#ff0' }); // Change color on hover
		});
		multiPlayerButton.on('pointerout', () => {
			multiPlayerButton.setStyle({ fill: '#fff' }); // Change color back when not hovered
		});
		multiPlayerButton.on('pointerup', () => { // Handle click events
			this.scene.start('Matchmaking'); // Start the main game scene
		});

		const settingButton = this.add.text(400, 200, 'Settings', {
			fontSize: '32px',
			align: 'center',
			color: '#fff',
		}).setInteractive();
		settingButton.on('pointerover', () => {
			settingButton.setStyle({ fill: '#ff0' }); // Change color on hover
		});
		settingButton.on('pointerout', () => {
			settingButton.setStyle({ fill: '#fff' }); // Change color back when not hovered
		});
		settingButton.on('pointerup', () => { // Handle click events
			this.scene.start('Settings'); // Start the main game scene
		});
	}

	update() {
		
	}

}