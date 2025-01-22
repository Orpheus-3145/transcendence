import { GAME } from '../Game.data';
import { GameDifficulty, GameMode, PowerUpType } from '../Types/types';
import { v4 as uuidv4 } from 'uuid';

export default class SettingsScene extends Phaser.Scene {
	// background texture
	private _keyEsc!: Phaser.Input.Keyboard.Key;

	private mode: GameMode = GameMode.unset;
	private difficulty: GameDifficulty = GameDifficulty.unset;

	private powerUpSelection: Set<PowerUpType> = new Set();

	constructor() {
		super({ key: 'Settings' });
	}

	// executed when scene.start('Matchmaking') is called
	init(): void {
		this._keyEsc = this.input.keyboard!.addKey(
			Phaser.Input.Keyboard.KeyCodes.ESC,
		) as Phaser.Input.Keyboard.Key;
	}

	// loading graphic assets, fired after init()
	preload(): void {}

	// run after preload(), shows a basic info of the error
	create(data: { mode: GameMode }): void {
		// defualt setting values
		this.powerUpSelection = new Set();
		this.mode = data.mode;

		// sets the background
		this.add
			.image(GAME.width / 2, GAME.height / 2, 'background')
			.setDisplaySize(this.scale.width, this.scale.height);

		this.add.text(500, 80, 'SETTINGS:', { fontSize: '40px', align: 'center', color: '#fff' });

		this.createTogglePowerUp(300, 150, PowerUpType.speedBall);
		this.createTogglePowerUp(300, 200, PowerUpType.speedPaddle);
		this.createTogglePowerUp(300, 250, PowerUpType.slowPaddle);
		this.createTogglePowerUp(300, 300, PowerUpType.shrinkPaddle);
		this.createTogglePowerUp(300, 350, PowerUpType.stretchPaddle);

		const startBtn = this.add
			.text(500, 550, this.mode === GameMode.single ? 'START' : 'JOIN QUEUE', {
				fontSize: '40px',
				align: 'center',
				color: '#0f0',
			})
			.setInteractive()
			.on('pointerover', () => startBtn.setStyle({ fill: '#ff0' }))
			.on('pointerout', () => startBtn.setStyle({ fill: '#0f0' }))
			.on('pointerup', () => this.startGame());

		if (this.mode === GameMode.single) {
			this.difficulty = GameDifficulty.medium;

			this.add.text(250, 450, 'DIFFICULTY', { fontSize: '32px', align: 'center', color: '#fff' });

			const easyModeToggle = this.add
				.text(600, 450, 'EASY', { fontSize: '32px', align: 'center', color: '#fff' })
				.setInteractive()
				.on('pointerup', () => {
					this.difficulty = GameDifficulty.easy;
					easyModeToggle.setStyle({ fill: '#0f0' });
					mediumModeToggle.setStyle({ fill: '#fff' });
					hardModeToggle.setStyle({ fill: '#fff' });
				});

			const mediumModeToggle = this.add
				.text(700, 450, 'MEDIUM', { fontSize: '32px', align: 'center', color: '#0f0' })
				.setInteractive()
				.on('pointerup', () => {
					this.difficulty = GameDifficulty.medium;
					easyModeToggle.setStyle({ fill: '#fff' });
					mediumModeToggle.setStyle({ fill: '#0f0' });
					hardModeToggle.setStyle({ fill: '#fff' });
				});

			const hardModeToggle = this.add
				.text(850, 450, 'HARD', { fontSize: '32px', align: 'center', color: '#fff' })
				.setInteractive()
				.on('pointerup', () => {
					this.difficulty = GameDifficulty.hard;
					easyModeToggle.setStyle({ fill: '#fff' });
					mediumModeToggle.setStyle({ fill: '#fff' });
					hardModeToggle.setStyle({ fill: '#0f0' });
				});
		}

		const goHomeButton = this.add // button for going home
			.text(GAME.width - 150, GAME.height - 100, 'Home', {
				fontSize: '32px',
				align: 'center',
				color: '#fff',
			})
			.setInteractive()
			.on('pointerover', () => goHomeButton.setStyle({ fill: '#ff0' })) // Change color on hover
			.on('pointerout', () => goHomeButton.setStyle({ fill: '#fff' })) // Change color back when not hovered
			.on('pointerup', () => this.scene.start('MainMenu')); // moves back to main
	}

	// run every frame update
	update(): void {
		// Exit game with ESC
		if (this._keyEsc.isDown) this.scene.start('MainMenu');
	}

	createTogglePowerUp(x: number, y: number, value: PowerUpType): void {
		this.add.text(x, y, `${value}`, { fontSize: '32px', align: 'center', color: '#fff' });
		const toggle = this.add
			.text(x + 350, y, 'INACTIVE', {
				fontSize: '32px',
				align: 'center',
				color: '#ff0',
			})
			.setInteractive()
			.on('pointerup', () => {
				if (this.powerUpSelection.has(value)) {
					this.powerUpSelection.delete(value);
					toggle.setText('INACTIVE');
					toggle.setStyle({ fill: '#ff0' }); // Green for ON, White for OFF
				} else {
					this.powerUpSelection.add(value);
					toggle.setText('ACTIVE');
					toggle.setStyle({ fill: '#0f0' }); // Green for ON, White for OFF
				}
			});
	}

	startGame(): void {
		if (this.mode === GameMode.single) {
			this.scene.start('Game', {
				sessionToken: uuidv4(),
				mode: this.mode,
				difficulty: this.difficulty,
				extras: Array.from(this.powerUpSelection),
			});
		} else {
			this.scene.start('Matchmaking', {
				sessionToken: '',
				mode: this.mode,
				difficulty: GameDifficulty.unset,
				extras: Array.from(this.powerUpSelection),
			});
		}
	}
}
