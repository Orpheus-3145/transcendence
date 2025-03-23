import { v4 as uuidv4 } from 'uuid';

import BaseScene from '/app/src/Pages/Game/GameComponent/PhaserGame/Scenes/Base';
import { GameMode, GameDifficulty, PowerUpType, PowerUpSelected } from '/app/src/Types/Game/Enum';
import { AnimationSelected } from '../../../../../Types/Game/Enum';


export default class SettingsScene extends BaseScene {

	private mode: GameMode = GameMode.unset;
	private difficulty: GameDifficulty = GameDifficulty.unset;

	private powerUpSelection: PowerUpSelected = PowerUpSelected.noPowerUp;

	constructor() {
		super({ key: 'Settings' });
	
	}

	init(data: { mode: GameMode, animationSelected: AnimationSelected}): void {
		super.init()
		console.log("Settings init is called");
		this.powerUpSelection = PowerUpSelected.noPowerUp;
		this.mode = data.mode;
		if (data && data.animationSelected !== undefined) {
			this._animationSelected = data.animationSelected;
		}
	}

	buildGraphicObjects(): void {
		super.buildGraphicObjects();

		this.add.text(this.scale.width * 0.5, this.scale.height * 0.17, 'SETTINGS', { 
			fontSize: `${Math.round(this._textFontRatio * this.scale.width) + 38}px`,
			align: 'center',
			color: '#fff' 
		})
		.setOrigin(0.5, 0.5);

		this.add.text(this.scale.width * 0.25, this.scale.height * 0.3, `${PowerUpType.speedBall}`,
			{ fontSize: `${Math.round(this._textFontRatio * this.scale.width)}px`,
				align: 'center',
				color: '#fff'}
		)
		.setOrigin(0, 0.5);
		this.createTogglePowerUp(this.scale.width * 0.25, this.scale.height * 0.3, PowerUpSelected.speedBall);
		this.add.text(this.scale.width * 0.25, this.scale.height * 0.36, `${PowerUpType.speedPaddle}`,
			{ fontSize: `${Math.round(this._textFontRatio * this.scale.width)}px`,
				align: 'center',
				color: '#fff'}
		)
		.setOrigin(0, 0.5);
		this.createTogglePowerUp(this.scale.width * 0.25, this.scale.height * 0.36, PowerUpSelected.speedPaddle);
		this.add.text(this.scale.width * 0.25, this.scale.height * 0.42, `${PowerUpType.slowPaddle}`,
			{ fontSize: `${Math.round(this._textFontRatio * this.scale.width)}px`,
				align: 'center',
				color: '#fff'}
		)
		.setOrigin(0, 0.5);
		this.createTogglePowerUp(this.scale.width * 0.25, this.scale.height * 0.42, PowerUpSelected.slowPaddle);
		this.add.text(this.scale.width * 0.25, this.scale.height * 0.48, `${PowerUpType.shrinkPaddle}`,
			{ fontSize: `${Math.round(this._textFontRatio * this.scale.width)}px`,
				align: 'center',
				color: '#fff'}
		)
		.setOrigin(0, 0.5);
		this.createTogglePowerUp(this.scale.width * 0.25, this.scale.height * 0.48, PowerUpSelected.shrinkPaddle);
		this.add.text(this.scale.width * 0.25, this.scale.height * 0.54, `${PowerUpType.stretchPaddle}`,
			{ fontSize: `${Math.round(this._textFontRatio * this.scale.width)}px`,
				align: 'center',
				color: '#fff'}
		)
		.setOrigin(0, 0.5);
		this.createTogglePowerUp(this.scale.width * 0.25, this.scale.height * 0.54, PowerUpSelected.stretchPaddle);

		const startBtn = this.add
			.text(this.scale.width * 0.5, this.scale.height * 0.75, this.mode === GameMode.single ? 'PLAY!' : 'JOIN QUEUE', {
				fontSize: `${Math.round(this._textFontRatio * this.scale.width) + 28}px`,
				align: 'center',
				color: '#d7263d'}
			)
			.setOrigin(0.5, 0.5)
			.setInteractive()
			.on('pointerover', () => startBtn.setStyle({ fill: '#f00' }))
			.on('pointerout', () => startBtn.setStyle({ fill: '#d7263d' }))
			.on('pointerup', () => this.startGame());

		if (this.mode === GameMode.single) {
			this.difficulty = GameDifficulty.medium;

			this.add.text(this.scale.width * 0.25, this.scale.height * 0.63, 'difficulty', {
				fontSize: `${Math.round(this._textFontRatio * this.scale.width)}px`,
				align: 'center',
				color: '#fff'}
			)
			.setOrigin(0, 0.5);

			const easyModeToggle = this.add
				.text(this.scale.width * 0.55, this.scale.height * 0.63, 'EASY', {
					fontSize: `${Math.round(this._textFontRatio * this.scale.width) + 8}px`,
					align: 'center',
					color: '#fff'}
				)
				.setOrigin(0.5, 0.5)
				.setInteractive()
				.on('pointerup', () => {
					this.difficulty = GameDifficulty.easy;
					easyModeToggle.setStyle({ fill: '#d7263d' });
					mediumModeToggle.setStyle({ fill: '#fff' });
					hardModeToggle.setStyle({ fill: '#fff' });
				});

			const mediumModeToggle = this.add
				.text(this.scale.width * 0.675, this.scale.height * 0.63, 'MEDIUM', {
					fontSize: `${Math.round(this._textFontRatio * this.scale.width) + 8}px`,
					align: 'center',
					color: '#d7263d'}
				)
				.setOrigin(0.5, 0.5)
				.setInteractive()
				.on('pointerup', () => {
					this.difficulty = GameDifficulty.medium;
					easyModeToggle.setStyle({ fill: '#fff' });
					mediumModeToggle.setStyle({ fill: '#d7263d' });
					hardModeToggle.setStyle({ fill: '#fff' });
				});

			const hardModeToggle = this.add
				.text(this.scale.width * 0.8, this.scale.height * 0.63, 'HARD', {
					fontSize: `${Math.round(this._textFontRatio * this.scale.width) + 8}px`,
					align: 'center',
					color: '#fff'}
				)
				.setOrigin(0.5, 0.5)
				.setInteractive()
				.on('pointerup', () => {
					this.difficulty = GameDifficulty.hard;
					easyModeToggle.setStyle({ fill: '#fff' });
					mediumModeToggle.setStyle({ fill: '#fff' });
					hardModeToggle.setStyle({ fill: '#d7263d' });
				});
		}

		const goHomeButton = this.add
			.text(this.scale.width * 0.9, this.scale.height * 0.9, 'Home', {
				fontSize: `${Math.round(this._textFontRatio * this.scale.width)}px`,
				align: 'center',
				color: '#fff'}
			)
			.setOrigin(0.5, 0.5)
			.setInteractive()
			.on('pointerover', () => goHomeButton.setStyle({ fill: '#FFA500' })) // Change color on hover
			.on('pointerout', () => goHomeButton.setStyle({ fill: '#fff' })) // Change color back when not hovered
			.on('pointerup', () => this.switchScene('MainMenu')); // Start the main game
	}


	createTogglePowerUp(x: number, y: number, value: PowerUpSelected): void {
    const toggleWidth = this.scale.width * 0.07; // Toggle width
    const toggleHeight = this.scale.height * 0.03; // Toggle height
    const borderRadius = toggleHeight / 2; // Half height for full rounding
    const knobRadius = toggleHeight * 0.8; // Slightly smaller for a better fit

    const toggleX = x + this.scale.width * 0.3; // Toggle's center X position
    const leftX = toggleX - (toggleWidth / 2) + borderRadius; // Leftmost knob position
    const rightX = toggleX + (toggleWidth / 2) - borderRadius; // Rightmost knob position

    // Draw the toggle background (rounded rectangle)
    const toggleGraphics = this.add.graphics();
    const drawToggle = (isActive: boolean) => {
        toggleGraphics.clear();
        toggleGraphics.fillStyle(isActive ? 0x3bb273 : 0xd2d2cf, 1); // Green if active, Red if inactive
        toggleGraphics.fillRoundedRect(toggleX - toggleWidth / 2, y - toggleHeight / 2, toggleWidth, toggleHeight, borderRadius);
    };

    drawToggle(false); // Default to inactive state

    // Create the circular knob
    const knob = this.add.circle(leftX, y, knobRadius, 0xffffff)
        .setOrigin(0.5, 0.5)
        .setInteractive();

    // Function to update toggle state
    const updateToggle = () => {
        const isActive = !(this.powerUpSelection & value);
        this.powerUpSelection = isActive ? (this.powerUpSelection | value) : (this.powerUpSelection & ~value);
        
        this.tweens.add({
            targets: knob,
            x: isActive ? rightX : leftX, // Move knob left or right
            duration: 200,
            ease: 'Power2'
        });

        drawToggle(isActive); // Redraw background with correct color
    };

		// Make it interactive
		knob.on('pointerup', updateToggle);
		toggleGraphics.setInteractive(new Phaser.Geom.Rectangle(toggleX - toggleWidth / 2, y - toggleHeight / 2, toggleWidth, toggleHeight), Phaser.Geom.Rectangle.Contains)
			.on('pointerup', updateToggle);
	}

	startGame(): void {
		if (this.mode === GameMode.single)
			this.switchScene('Game',
				{
					gameData: {
					sessionToken: uuidv4(),
					mode: this.mode,
					difficulty: this.difficulty,
					extras: this.powerUpSelection,
					}, 
					animationSelected: this._animationSelected
				}
			);
		else
			this.switchScene('Matchmaking', 
				{
					gameData: {
					sessionToken: '',
					mode: this.mode,
					difficulty: GameDifficulty.unset,
					extras: this.powerUpSelection,
					}, 
					animationSelected: this._animationSelected
				}
			);
	}

	destroy(): void {
		super.destroy();
	}
}
