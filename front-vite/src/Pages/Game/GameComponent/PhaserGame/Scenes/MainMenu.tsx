import { GAME } from '../Game.data'

class MainMenu extends Phaser.Scene {
	
	// background texture
	private _background!: Phaser.GameObjects.Image;
	
	constructor () {

		super({ key: 'MainMenu' });

	}
	
	// preloading operations, fired when 
	// scene.start('MainMenu') is called,
	init (): void {
		
	}
	
	// loading graphic assets, fired after init()
	preload(): void {
		
		this.load.image('background', GAME.background)
	}

	// run after preload(), creation of the elements of the menu
	create (): void {

		// sets the background
		this._background = this.add.image(GAME.width / 2, GAME.height / 2, 'background');
		this._background.setDisplaySize(this.scale.width, this.scale.height);

		// single player mode button
		const singlePlayerButton = this.add.text(400, 100, 'Play [single player]', {
			fontSize: '32px',
			align: 'center',
			color: '#fff',
		}).setInteractive();

		// Change color on hover
		singlePlayerButton.on('pointerover', () => singlePlayerButton.setStyle({ fill: '#ff0' }));
		// Change color back when not hovered
		singlePlayerButton.on('pointerout', () => singlePlayerButton.setStyle({ fill: '#fff' }));
		 // Start the main game
		singlePlayerButton.on('pointerup', () => {
				this.scene.start('Game', {id: 'id1', bot: true});
				// this.scene.start('Game', {idLeft: 'id1', idRight: 'id2'})
		});

		// multi player mode button
		const multiPlayerButton = this.add.text(400, 150, 'Play [multi player]', {
			fontSize: '32px',
			align: 'center',
			color: '#fff',
		}).setInteractive();

		// Change color on hover
		multiPlayerButton.on('pointerover', () => multiPlayerButton.setStyle({ fill: '#ff0' }));
		// Change color back when not hovered
		multiPlayerButton.on('pointerout', () => multiPlayerButton.setStyle({ fill: '#fff' }));
		 // Start the main game
		multiPlayerButton.on('pointerup', () => this.scene.start('Matchmaking'));

		// settings button
		const settingButton = this.add.text(400, 200, 'Settings', {
			fontSize: '32px',
			align: 'center',
			color: '#fff',
		}).setInteractive();

		// Change color on hover
		settingButton.on('pointerover', () => settingButton.setStyle({ fill: '#ff0' }));
		// Change color back when not hovered
		settingButton.on('pointerout', () => settingButton.setStyle({ fill: '#fff' }));
		// goes to settings
		settingButton.on('pointerup', () => this.scene.start('Settings'));
	}

	// run every frame update
	update(): void {
		
	}

};

export default MainMenu;