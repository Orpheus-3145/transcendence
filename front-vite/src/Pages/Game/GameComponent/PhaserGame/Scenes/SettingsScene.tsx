import { GAME } from '../Game.data';
import { GameDifficulty, GameMode, PowerUpSelection } from '../Types/types';
import { v4 as uuidv4 } from 'uuid';

export default class SettingsScene extends Phaser.Scene {
	// background texture
	private _background!: Phaser.GameObjects.Image;
	private _keyEsc!: Phaser.Input.Keyboard.Key;

	private mode: GameMode = GameMode.unset;
	private difficulty: GameDifficulty = GameDifficulty.unset;

	private powerUpSelection: PowerUpSelection = {
		speedball: false,
		powerup_2: false,
		powerup_3: false,
		powerup_4: false,
	};

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
	create(data: {mode: GameMode}): void {
		
		this.mode = data.mode;
		// sets the background
		this._background = this.add.image(GAME.width / 2, GAME.height / 2, 'background');
		this._background.setDisplaySize(this.scale.width, this.scale.height);

		this.add.text(500, 150, 'SETTINGS:', { fontSize: '32px',	align: 'center',	color: '#fff' });
		
		this.powerUpSelection = {
			speedball: false,
			powerup_2: false,
			powerup_3: false,
			powerup_4: false
		};

		this.add.text(250, 200, 'SpeedBall', { fontSize: '32px',	align: 'center',	color: '#fff' });
		const speedBallToggle = this.add
		.text(600, 200, 'INACTIVE', { fontSize: '32px',	align: 'center',	color: '#ff0' })
		.setInteractive()
		.on('pointerup', () => {
			this.powerUpSelection.speedball = !this.powerUpSelection.speedball;
			speedBallToggle.setText(this.powerUpSelection.speedball ? 'ACTIVE' : 'INACTIVE');
			speedBallToggle.setStyle({ fill: this.powerUpSelection.speedball ? '#0f0' : '#ff0' }); // Green for ON, White for OFF
		});
	
		this.add.text(250, 250, '[TBD] powerup_2', { fontSize: '32px',	align: 'center',	color: '#fff' })
		const powerUp2Toggle = this.add
		.text(600, 250, 'INACTIVE', { fontSize: '32px',	align: 'center',	color: '#ff0' })
		.setInteractive()
		.on('pointerup', () => {
			this.powerUpSelection.powerup_2 = !this.powerUpSelection.powerup_2;
			powerUp2Toggle.setText(this.powerUpSelection.powerup_2 ? 'ACTIVE' : 'INACTIVE');
			powerUp2Toggle.setStyle({ fill: this.powerUpSelection.powerup_2 ? '#0f0' : '#ff0' }); // Green for ON, White for OFF
		});

		this.add.text(250, 300, '[TBD] powerup_3', { fontSize: '32px',	align: 'center',	color: '#fff' })
		const powerUp3Toggle = this.add
		.text(600, 300, 'INACTIVE', { fontSize: '32px', align: 'center', color: '#ff0' })
		.setInteractive()
		.on('pointerup', () => {
			this.powerUpSelection.powerup_3 = !this.powerUpSelection.powerup_3;
			powerUp3Toggle.setText(this.powerUpSelection.powerup_3 ? 'ACTIVE' : 'INACTIVE');
			powerUp3Toggle.setStyle({ fill: this.powerUpSelection.powerup_3 ? '#0f0' : '#ff0' }); // Green for ON, White for OFF
		});

		this.add.text(250, 350, '[TBD] powerup_4', { fontSize: '32px',	align: 'center',	color: '#fff' })
		const powerUp4Toggle = this.add
		.text(600, 350, 'INACTIVE', {
			fontSize: '32px',
			align: 'center',
			color: '#ff0',
		})
		.setInteractive()
		.on('pointerup', () => {
			this.powerUpSelection.powerup_4 = !this.powerUpSelection.powerup_4;
			powerUp4Toggle.setText(this.powerUpSelection.powerup_4 ? 'ACTIVE' : 'INACTIVE');
			powerUp4Toggle.setStyle({ fill: this.powerUpSelection.powerup_4 ? '#0f0' : '#ff0' }); // Green for ON, White for OFF
		});

		this.add.text(250, 400, '[TBD] powerup_5', { fontSize: '32px',	align: 'center',	color: '#fff' })
		const powerUp5Toggle = this.add
		.text(600, 400, 'INACTIVE', {
			fontSize: '32px',
			align: 'center',
			color: '#ff0',
		})
		.setInteractive()
		.on('pointerup', () => {
			this.powerUpSelection.powerup_5 = !this.powerUpSelection.powerup_5;
			powerUp5Toggle.setText(this.powerUpSelection.powerup_5 ? 'ACTIVE' : 'INACTIVE');
			powerUp5Toggle.setStyle({ fill: this.powerUpSelection.powerup_5 ? '#0f0' : '#ff0' }); // Green for ON, White for OFF
		});

		const startBtn = this.add
		.text(500, 550, this.mode === GameMode.single ? 'START' : 'JOIN QUEUE', {
			fontSize: '32px',
			align: 'center',
			color: '#0f0',
		})
		.setInteractive()
		.on('pointerover', () => startBtn.setStyle({ fill: '#ff0' }))
		.on('pointerout', () => startBtn.setStyle({ fill: '#0f0' }))
		.on('pointerup', () => {

			if (this.mode === GameMode.single) {
				this.scene.start('Game', {
					sessionToken: uuidv4(),
					mode: this.mode,
					difficulty: this.difficulty,
					extras: this.powerUpSelection,
				});
			} else {
				this.scene.start('Matchmaking', {
					sessionToken: '',
					mode: this.mode,
					difficulty: GameDifficulty.unset,
					extras: this.powerUpSelection,
				});
			}
		});

		if (this.mode === GameMode.single) {

			this.difficulty = GameDifficulty.medium;
	
			this.add.text(250, 450, 'DIFFICULTY', { fontSize: '32px',	align: 'center',	color: '#fff' })
			
			const easyModeToggle = this.add
			.text(600, 450, 'EASY', { fontSize: '32px',	align: 'center', color: '#fff' })
			.setInteractive()
			.on('pointerup', () => {
				this.difficulty = GameDifficulty.easy;
				easyModeToggle.setStyle({ fill: '#0f0' });
				mediumModeToggle.setStyle({ fill: '#fff' });
				hardModeToggle.setStyle({ fill: '#fff' });
			});

			const mediumModeToggle = this.add
			.text(700, 450, 'MEDIUM', { fontSize: '32px',	align: 'center', color: '#0f0' })
			.setInteractive()
			.on('pointerup', () => {
				this.difficulty = GameDifficulty.medium;
				easyModeToggle.setStyle({ fill: '#fff' });
				mediumModeToggle.setStyle({ fill: '#0f0' });
				hardModeToggle.setStyle({ fill: '#fff' });
			});

			const hardModeToggle = this.add
			.text(850, 450, 'HARD', { fontSize: '32px',	align: 'center', color: '#fff' })
			.setInteractive()
			.on('pointerup', () => {
				this.difficulty = GameDifficulty.hard;
				easyModeToggle.setStyle({ fill: '#fff' });
				mediumModeToggle.setStyle({ fill: '#fff' });
				hardModeToggle.setStyle({ fill: '#0f0' });
			});
		}

		const goHomeButton = this.add			// button for going home
			.text(GAME.width - 150, GAME.height - 100, 'Home', {
				fontSize: '32px',
				align: 'center',
				color: '#fff',
			})
			.setInteractive()
			.on('pointerover', () => goHomeButton.setStyle({ fill: '#ff0' }))	// Change color on hover
			.on('pointerout', () => goHomeButton.setStyle({ fill: '#fff' }))	// Change color back when not hovered
			.on('pointerup', () => this.scene.start('MainMenu'));							// moves back to main
	}

	// run every frame update
	update(): void {

		// Exit game with ESC
		if (this._keyEsc.isDown) {
			this.scene.start('MainMenu');
		}
	}
}
