import { GAME } from '../Game.data';

import * as GameTypes from '../Types/types';

export default class MainMenu extends Phaser.Scene {
	
	// background texture
	private _background!: Phaser.GameObjects.Image;

	// extras toggle state
	private _extrasEnabled: boolean = false;

	constructor() {
		super({ key: 'MainMenu' });
	};
	
	// scene.start('MainMenu') is called,
	init (): void {};
	
	// loading graphic assets, fired after init()
	preload(): void {
		
		this.load.image('background', GAME.background)
	};

	// run after preload(), creation of the elements of the menu
	create(): void {
		// sets the background
		this._background = this.add.image(GAME.width / 2, GAME.height / 2, 'background');
		this._background.setDisplaySize(this.scale.width, this.scale.height);
				// Create the toggle button
		// this.createToggleSwitch(this.scale.width - 100, 50);
		this.createToggle(this.scale.width - 250, 50, "Extras on", "Extras off");

		this.createBtn(400, 100, 'Play [single player]').on(
			'pointerup', () => this.scene.start('Game', {sessionToken: 'singlePlayerToken', mode: GameTypes.GameMode.single, extras: this._extrasEnabled}));
		this.createBtn(400, 150, 'Play [multi player]').on(
			'pointerup', () => this.scene.start('Matchmaking'));
		this.createBtn(400, 200, 'Settings').on(
			'pointerup', () => this.scene.start('Settings'));
	};

	// run every frame update
	update(): void {};

	createBtn(x: number, y: number, content: string): Phaser.GameObjects.Text {

		const newBtn = this.add.text(x, y, content, {
			fontSize: '32px',
			align: 'center',
			color: '#fff',
		}).setInteractive();

		// Change color on hover
		newBtn.on('pointerover', () => newBtn.setStyle({ fill: '#ff0' }));
		// Change color back when not hovered
		newBtn.on('pointerout', () => newBtn.setStyle({ fill: '#fff' }));
		// goes to settings
		return (newBtn);
	}

	createToggle(x: number, y: number, onText: string, offText: string): void {
		const toggleBtn = this.add.text(x, y, offText, {
			fontSize: '32px',
			align: 'center'
		}).setInteractive();

		// Change color on hover
		toggleBtn.on('pointerover', () => toggleBtn.setStyle({ fill: '#ff0' }));
		// Change color back when not hovered
		toggleBtn.on('pointerout', () => toggleBtn.setStyle({ fill: '#fff' }));

		// Toggle the state and update the button text
		toggleBtn.on('pointerup', () => {
			this._extrasEnabled = !this._extrasEnabled;
			toggleBtn.setText(this._extrasEnabled ? onText : offText);
			toggleBtn.setStyle({ fill: this._extrasEnabled ? '#0f0' : '#fff' }); // Green for ON, White for OFF
			this.sound.play('clickSound'); // Optional: play a sound on toggle
		});

		// Initial color based on default state
    	toggleBtn.setStyle({ fill: this._extrasEnabled ? '#0f0' : '#fff' });
	}
createToggleSwitch(x: number, y: number): void {
		// Create the background for the toggle (a rounded rectangle)
		const toggleBg = this.add.rectangle(x, y, 80, 40, 0x555555, 0.8)
			.setOrigin(0.5, 0.5)
			.setInteractive()
			.setStrokeStyle(2, 0xffffff);

		// Create the toggle button (circle)
		const toggleBtn = this.add.circle(x - 20, y, 16, 0xffffff)
			.setInteractive();

		// Text to indicate the state
		const toggleText = this.add.text(x + 50, y, 'OFF', {
			fontSize: '20px',
			color: '#fff',
		}).setOrigin(0.5, 0.5);

		// Toggle behavior
		toggleBg.on('pointerup', () => this.toggleSwitch(toggleBtn, toggleText, toggleBg, x, y));
		toggleBtn.on('pointerup', () => this.toggleSwitch(toggleBtn, toggleText, toggleBg, x, y));
	}

	toggleSwitch(toggleBtn: Phaser.GameObjects.Arc, toggleText: Phaser.GameObjects.Text, toggleBg: Phaser.GameObjects.Rectangle, x: number, y: number): void {
		this._extrasEnabled = !this._extrasEnabled;

		if (this._extrasEnabled) {
			// Move the toggle circle to the right and update text
			toggleBtn.x = x + 20;
			toggleBg.fillColor = 0x00ff00; // Green for "ON"
			toggleText.setText('ON');
		} else {
			// Move the toggle circle to the left and update text
			toggleBtn.x = x - 20;
			toggleBg.fillColor = 0x555555; // Gray for "OFF"
			toggleText.setText('OFF');
		}
	}
};
