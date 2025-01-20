import { GAME } from '../Game.data';
import { GameDifficulty, GameMode, PowerUpSelection } from '../Types/types';
import { v4 as uuidv4 } from 'uuid';

export default class SettingsScene extends Phaser.Scene {
	// background texture
	private _background!: Phaser.GameObjects.Image;

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

		// this.events.on('shutdown', () => {console.log(this.mode); console.log(this.difficulty); console.log(this.powerUpSelection);}, this);
	}
	
	// loading graphic assets, fired after init()
	preload(): void {}
	
	// run after preload(), shows a basic info of the error
	create(data: {mode: GameMode}): void {
		
		this.mode = data.mode;
		// sets the background
		this._background = this.add.image(GAME.width / 2, GAME.height / 2, 'background');
		this._background.setDisplaySize(this.scale.width, this.scale.height);

		this.createLabel(400, 150, 'GAME SETTINGS');
		
		this.powerUpSelection = {
			speedball: false,
			powerup_2: false,
			powerup_3: false,
			powerup_4: false
		};

		this.createLabel(200, 200, 'SpeedBall:');
		const speedBallToggle = this.add
		.text(550, 200, 'INACTIVE', {
			fontSize: '32px',
			align: 'center',
			color: '#ff0',
		})
		.setInteractive()
		.on('pointerup', () => {
			this.powerUpSelection.speedball = !this.powerUpSelection.speedball;
			speedBallToggle.setText(this.powerUpSelection.speedball ? 'ACTIVE' : 'INACTIVE');
			speedBallToggle.setStyle({ fill: this.powerUpSelection.speedball ? '#0f0' : '#ff0' }); // Green for ON, White for OFF
		});
	
		this.createLabel(200, 250, '[TBD] powerup_2:');
		const powerUp2Toggle = this.add
		.text(550, 250, 'INACTIVE', {
			fontSize: '32px',
			align: 'center',
			color: '#ff0',
		})
		.setInteractive()
		.on('pointerup', () => {
			this.powerUpSelection.powerup_2 = !this.powerUpSelection.powerup_2;
			powerUp2Toggle.setText(this.powerUpSelection.powerup_2 ? 'ACTIVE' : 'INACTIVE');
			powerUp2Toggle.setStyle({ fill: this.powerUpSelection.powerup_2 ? '#0f0' : '#ff0' }); // Green for ON, White for OFF
		});

		this.createLabel(200, 300, '[TBD] powerup_3:');
		const powerUp3Toggle = this.add
		.text(550, 300, 'INACTIVE', {
			fontSize: '32px',
			align: 'center',
			color: '#ff0',
		})
		.setInteractive()
		.on('pointerup', () => {
			this.powerUpSelection.powerup_3 = !this.powerUpSelection.powerup_3;
			powerUp3Toggle.setText(this.powerUpSelection.powerup_3 ? 'ACTIVE' : 'INACTIVE');
			powerUp3Toggle.setStyle({ fill: this.powerUpSelection.powerup_3 ? '#0f0' : '#ff0' }); // Green for ON, White for OFF
		});

		this.createLabel(200, 350, '[TBD] powerup_4:');
		const powerUp4Toggle = this.add
		.text(550, 350, 'INACTIVE', {
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

		const startBtn = this.add
		.text(500, 500, this.mode === GameMode.single ? 'START' : 'JOIN QUEUE', {
			fontSize: '32px',
			align: 'center',
			color: '#fff',
		})
		.setInteractive()
		.on('pointerover', () => startBtn.setStyle({ fill: '#ff0' }))
		.on('pointerout', () => startBtn.setStyle({ fill: '#fff' }))
		.on('pointerup', () => {

			if (this.mode === GameMode.single) {
				this.scene.start('Game', {
					sessionToken: uuidv4(),
					mode: this.mode,
					extras: this.powerUpSelection,
				});
			} else {
				this.scene.start('Matchmaking', {
					sessionToken: '',
					mode: this.mode,
					extras: this.powerUpSelection,
				});
			}
		});

		if (this.mode === GameMode.single) {

			this.difficulty = GameDifficulty.medium;
	
			this.createLabel(200, 400, 'DIFFICULTY:');
			const easyModeToggle = this.add
			.text(550, 400, 'EASY', {
				fontSize: '32px',
				align: 'center',
				color: '#fff',
			})
			.setInteractive()
			.on('pointerup', () => {
				this.difficulty = GameDifficulty.easy;
				easyModeToggle.setStyle({ fill: '#0f0' });
				mediumModeToggle.setStyle({ fill: '#fff' });
				hardModeToggle.setStyle({ fill: '#fff' });
			});

			const mediumModeToggle = this.add
			.text(650, 400, 'MEDIUM', {
				fontSize: '32px',
				align: 'center',
				color: '#0f0',
			})
			.setInteractive()
			.on('pointerup', () => {
				this.difficulty = GameDifficulty.medium;
				easyModeToggle.setStyle({ fill: '#fff' });
				mediumModeToggle.setStyle({ fill: '#0f0' });
				hardModeToggle.setStyle({ fill: '#fff' });
			});

			const hardModeToggle = this.add
			.text(800, 400, 'HARD', {
				fontSize: '32px',
				align: 'center',
				color: '#fff',
			})
			.setInteractive()
			.on('pointerup', () => {
				this.difficulty = GameDifficulty.hard;
				easyModeToggle.setStyle({ fill: '#fff' });
				mediumModeToggle.setStyle({ fill: '#fff' });
				hardModeToggle.setStyle({ fill: '#0f0' });
			});
		}

		// button for going home
		const goHomeButton = this.add
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
	update(): void {}

	createLabel(pos_x: number, pos_y: number, content: string, fontSize='32px', align='center', color='#fff',): Phaser.GameObjects.Text {

		const textItem = this.add.text(pos_x, pos_y, content, {
			fontSize: fontSize,
			align: align,
			color: color,
		});

		return textItem;
	}

	createToggle(x: number, y: number, onText: string, offText: string, flag: boolean, callback: () => void): Phaser.GameObjects.Text {
		
		const toggleBtn = this.add
			.text(x, y, offText, {
				fontSize: '32px',
				align: 'center',
				color: '#ff0',
			})
			.setInteractive();

		// Change color on hover
		// toggleBtn.on('pointerover', () => toggleBtn.setStyle({ fill: '#fff' }));
		// // Change color back when not hovered
		// toggleBtn.on('pointerout', () => toggleBtn.setStyle({ fill: '#ff0' }));

		// Toggle the state and update the button text
		toggleBtn.on('pointerup', callback);

		// Initial color based on default state
		// toggleBtn.setStyle({ fill: flag ? '#0f0' : '#ff0' });
		
		return toggleBtn;
	}
}
