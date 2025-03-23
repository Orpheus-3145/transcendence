import { v4 as uuidv4 } from 'uuid';

import BaseScene from '/app/src/Pages/Game/GameComponent/PhaserGame/Scenes/Base';
import TextWidget from '/app/src/Pages/Game/GameComponent/PhaserGame/GameObjects/TextWidget';
import ToggleWidget from '/app/src/Pages/Game/GameComponent/PhaserGame/GameObjects/Slider';
import ButtonWidget from '/app/src/Pages/Game/GameComponent/PhaserGame/GameObjects/Button';
import { GameMode, GameDifficulty, PowerUpType, PowerUpSelected } from '/app/src/Types/Game/Enum';


export default class SettingsScene extends BaseScene {

	private mode: GameMode = GameMode.unset;
	private difficulty: GameDifficulty = GameDifficulty.medium;

	private powerUpSelection: PowerUpSelected = PowerUpSelected.noPowerUp;

	constructor() {
		super({ key: 'Settings' });
	}

	init(data: { mode: GameMode }): void {
		super.init()

		this.powerUpSelection = PowerUpSelected.noPowerUp;
		this.mode = data.mode;

		this.difficulty = GameDifficulty.medium;
	}

	buildGraphicObjects(): void {
		super.buildGraphicObjects();

		this._widgets.push(
			new TextWidget(
				this,
				this.scale.width * 0.5,
				this.scale.height * 0.17,
				'SETTINGS',
				50,
		));
		
		this._widgets.push(
			new TextWidget(
				this,
				this.scale.width * 0.3,
				this.scale.height * 0.29,
				`${PowerUpType.speedBall}`,
				2,
				'#fff',
				'left'
		));
		this._widgets.push(
			new ToggleWidget(
				this,
				this.scale.width * 0.6,
				this.scale.height * 0.29,
				(value: boolean) => {
					this.powerUpSelection = value ? 
						(this.powerUpSelection | PowerUpSelected.speedBall) : 
						(this.powerUpSelection & ~PowerUpSelected.speedBall);
				}
		));

		this._widgets.push(
			new TextWidget(
				this,
				this.scale.width * 0.3,
				this.scale.height * 0.36,
				`${PowerUpType.speedPaddle}`,
				2,
				'#fff',
				'left'
		));
		this._widgets.push(
			new ToggleWidget(
				this,
				this.scale.width * 0.6,
				this.scale.height * 0.36,
				(value: boolean) => {
					this.powerUpSelection = value ? 
						(this.powerUpSelection | PowerUpSelected.speedPaddle) : 
						(this.powerUpSelection & ~PowerUpSelected.speedPaddle);
				}
		));

		this._widgets.push(
			new TextWidget(
				this,
				this.scale.width * 0.3,
				this.scale.height * 0.43,
				`${PowerUpType.slowPaddle}`,
				2,
				'#fff',
				'left'
		));
		this._widgets.push(
			new ToggleWidget(
				this,
				this.scale.width * 0.6,
				this.scale.height * 0.43,
				(value: boolean) => {
					this.powerUpSelection = value ? 
						(this.powerUpSelection | PowerUpSelected.slowPaddle) : 
						(this.powerUpSelection & ~PowerUpSelected.slowPaddle);
				}
		));
		
		this._widgets.push(
			new TextWidget(
				this,
				this.scale.width * 0.3,
				this.scale.height * 0.50,
				`${PowerUpType.shrinkPaddle}`,
				2,
				'#fff',
				'left'
		));
		this._widgets.push(
			new ToggleWidget(
				this,
				this.scale.width * 0.6,
				this.scale.height * 0.50,
				(value: boolean) => {
					this.powerUpSelection = value ? 
						(this.powerUpSelection | PowerUpSelected.shrinkPaddle) : 
						(this.powerUpSelection & ~PowerUpSelected.shrinkPaddle);
				}
		));

		this._widgets.push(
			new TextWidget(
				this,
				this.scale.width * 0.3,
				this.scale.height * 0.57,
				`${PowerUpType.stretchPaddle}`,
				2,
				'#fff',
				'left'
		));
		this._widgets.push(
			new ToggleWidget(
				this,
				this.scale.width * 0.6,
				this.scale.height * 0.57,
				(value: boolean) => {
					this.powerUpSelection = value ? 
						(this.powerUpSelection | PowerUpSelected.stretchPaddle) : 
						(this.powerUpSelection & ~PowerUpSelected.stretchPaddle);
				}
		));

		// start game / join matchmaking list
		this._widgets.push(
			new ButtonWidget(
				this,
				this.scale.width * 0.5,
				this.scale.height * 0.85,
				this.mode === GameMode.single ? 'PLAY!' : 'JOIN QUEUE',
				() => this.startGame(),
				45,
				'#00ff00'
		));
	
		if (this.mode === GameMode.single) {
			
			const easyModeToggle = new TextWidget(
				this,
				this.scale.width * 0.3,
				this.scale.height * 0.7,
				'EASY',
				20
			).setStroke("#ffff00", 2)
			.setInteractive()
			.on('pointerup', () => {
				this.difficulty = GameDifficulty.easy;
				easyModeToggle.setStyle({ fill: '#ffff00' });
				mediumModeToggle.setStyle({ fill: '#fff' });
				hardModeToggle.setStyle({ fill: '#fff' });
			});
			this._widgets.push(easyModeToggle);

			const mediumModeToggle = new TextWidget(
				this,
				this.scale.width * 0.5 ,
				this.scale.height * 0.7,
				'MEDIUM',
				20,
				"#ffa500"
			).setStroke("#ffa500", 2)
			.setInteractive()
			.on('pointerup', () => {
				this.difficulty = GameDifficulty.medium;
				easyModeToggle.setStyle({ fill: '#fff' });
				mediumModeToggle.setStyle({ fill: '#ffa500' });
				hardModeToggle.setStyle({ fill: '#fff' });
			});
			this._widgets.push(mediumModeToggle);

			const hardModeToggle = new TextWidget(
				this,
				this.scale.width * 0.7,
				this.scale.height * 0.7,
				'HARD',
				20,
			).setStroke("#ff0000", 2)
			.setInteractive()
			.on('pointerup', () => {
				this.difficulty = GameDifficulty.hard;
				easyModeToggle.setStyle({ fill: '#fff' });
				mediumModeToggle.setStyle({ fill: '#fff' });
				hardModeToggle.setStyle({ fill: '#ff0000' });
			});
			this._widgets.push(hardModeToggle);
		}

		// go back home btn
		this._widgets.push(new ButtonWidget(
			this,
			this.scale.width * 0.9,
			this.scale.height * 0.9,
			'Home',
			() => this.switchScene('MainMenu'),
			20,
			'#dd0000'
		));
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
