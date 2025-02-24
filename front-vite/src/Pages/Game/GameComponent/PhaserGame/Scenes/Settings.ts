import { v4 as uuidv4 } from 'uuid';

import BaseScene from './Base';
import { GameMode, GameDifficulty, PowerUpType, PowerUpSelected } from '../../Types/Enum';


export default class SettingsScene extends BaseScene {

	private mode: GameMode = GameMode.unset;
	private difficulty: GameDifficulty = GameDifficulty.unset;

	private powerUpSelection: PowerUpSelected = PowerUpSelected.noPowerUp;

	constructor() {
		super({ key: 'Settings' });
	}

	init(data: { mode: GameMode }): void {
		super.init()

		this.powerUpSelection = PowerUpSelected.noPowerUp;
		this.mode = data.mode;
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
			.text(this.scale.width * 0.5, this.scale.height * 0.75, this.mode === GameMode.single ? 'START' : 'JOIN QUEUE', {
				fontSize: `${Math.round(this._textFontRatio * this.scale.width) + 28}px`,
				align: 'center',
				color: '#0f0'}
			)
			.setOrigin(0.5, 0.5)
			.setInteractive()
			.on('pointerover', () => startBtn.setStyle({ fill: '#ff0' }))
			.on('pointerout', () => startBtn.setStyle({ fill: '#0f0' }))
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
					easyModeToggle.setStyle({ fill: '#0f0' });
					mediumModeToggle.setStyle({ fill: '#fff' });
					hardModeToggle.setStyle({ fill: '#fff' });
				});

			const mediumModeToggle = this.add
				.text(this.scale.width * 0.675, this.scale.height * 0.63, 'MEDIUM', {
					fontSize: `${Math.round(this._textFontRatio * this.scale.width) + 8}px`,
					align: 'center',
					color: '#0f0'}
				)
				.setOrigin(0.5, 0.5)
				.setInteractive()
				.on('pointerup', () => {
					this.difficulty = GameDifficulty.medium;
					easyModeToggle.setStyle({ fill: '#fff' });
					mediumModeToggle.setStyle({ fill: '#0f0' });
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
					hardModeToggle.setStyle({ fill: '#0f0' });
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
			.on('pointerover', () => goHomeButton.setStyle({ fill: '#ff0' })) // Change color on hover
			.on('pointerout', () => goHomeButton.setStyle({ fill: '#fff' })) // Change color back when not hovered
			.on('pointerup', () => this.switchScene('MainMenu')); // Start the main game
	}

	createTogglePowerUp(x: number, y: number, value: PowerUpSelected): void {
		const toggle = this.add
			.text(x + this.scale.width * 0.3, y, 'INACTIVE', {
				fontSize: `${Math.round(this._textFontRatio * this.scale.width)}px`,
				align: 'center',
				color: '#ff0'}
			)
			.setOrigin(0, 0.5)
			.setInteractive()
			.on('pointerup', () => {
				if ( this.powerUpSelection & value ) {
					this.powerUpSelection &= ~value;
					toggle.setText('INACTIVE');
					toggle.setStyle({ fill: '#ff0' }); // Green for ON, White for OFF
				} else {
					this.powerUpSelection |= value;
					toggle.setText('ACTIVE');
					toggle.setStyle({ fill: '#0f0' }); // Green for ON, White for OFF
				}}
			);
	}

	startGame(): void {
		if (this.mode === GameMode.single)
			this.switchScene('Game', {
				sessionToken: uuidv4(),
				mode: this.mode,
				difficulty: this.difficulty,
				extras: this.powerUpSelection,
			});
		else
			this.switchScene('Matchmaking', {
				sessionToken: '',
				mode: this.mode,
				difficulty: GameDifficulty.unset,
				extras: this.powerUpSelection,
			});
	}
}
