import { v4 as uuidv4 } from 'uuid';

import BaseScene from '/app/src/Pages/Game/GameComponent/PhaserGame/Scenes/Base';
import { GameMode, GameDifficulty, PowerUpType, PowerUpSelected } from '/app/src/Types/Game/Enum';
import TextWidget from '../GameObjects/TextWidget';
import ToggleWidget from '../GameObjects/Slider';


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

		this._widgets.push(
			new TextWidget(
				this,
				this.scale.width * 0.5,
				this.scale.height * 0.17,
				'SETTINGS',
				20,
		));
		
		this._widgets.push(
			new TextWidget(
				this,
				this.scale.width * 0.25,
				this.scale.height * 0.3,
				`${PowerUpType.speedBall}`,
				2,
				'#fff',
				'left'
		));
		this._widgets.push(
			new ToggleWidget(
				this,
				this.scale.width * 0.65,
				this.scale.height * 0.3,
				(value: boolean) => {
					this.powerUpSelection = value ? 
						(this.powerUpSelection | PowerUpSelected.speedBall) : 
						(this.powerUpSelection & ~PowerUpSelected.speedBall);
				}
		));

		this._widgets.push(
			new TextWidget(
				this,
				this.scale.width * 0.25,
				this.scale.height * 0.36,
				`${PowerUpType.speedPaddle}`,
				2,
				'#fff',
				'left'
		));
		this._widgets.push(
			new ToggleWidget(
				this,
				this.scale.width * 0.65,
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
				this.scale.width * 0.25,
				this.scale.height * 0.42,
				`${PowerUpType.slowPaddle}`,
				2,
				'#fff',
				'left'
		));
		this._widgets.push(
			new ToggleWidget(
				this,
				this.scale.width * 0.65,
				this.scale.height * 0.42,
				(value: boolean) => {
					this.powerUpSelection = value ? 
						(this.powerUpSelection | PowerUpSelected.slowPaddle) : 
						(this.powerUpSelection & ~PowerUpSelected.slowPaddle);
				}
		));
		
		this._widgets.push(
			new TextWidget(this,
				this.scale.width * 0.25,
				this.scale.height * 0.48,
				`${PowerUpType.shrinkPaddle}`,
				2,
				'#fff',
				'left'
		));
		this._widgets.push(
			new ToggleWidget(
				this,
				this.scale.width * 0.65,
				this.scale.height * 0.48,
				(value: boolean) => {
					this.powerUpSelection = value ? 
						(this.powerUpSelection | PowerUpSelected.shrinkPaddle) : 
						(this.powerUpSelection & ~PowerUpSelected.shrinkPaddle);
				}
		));

		this._widgets.push(
			new TextWidget(this,
				this.scale.width * 0.25,
				this.scale.height * 0.54,
				`${PowerUpType.stretchPaddle}`,
				2,
				'#fff',
				'left'
		));
		this._widgets.push(
			new ToggleWidget(
				this,
				this.scale.width * 0.65,
				this.scale.height * 0.54,
				(value: boolean) => {
					this.powerUpSelection = value ? 
						(this.powerUpSelection | PowerUpSelected.stretchPaddle) : 
						(this.powerUpSelection & ~PowerUpSelected.stretchPaddle);
				}
		));

		const startBtn = new TextWidget(
			this,
			this.scale.width * 0.5,
			this.scale.height * 0.75,
			this.mode === GameMode.single ? 'PLAY!' : 'JOIN QUEUE',
			25,
			'#fff'
		).setStroke("#0f0", 2)		// NB save it for TextButton
		.setInteractive()
		.on('pointerover', () => startBtn.setStyle({ fill: '#0f0' }))
		.on('pointerout', () => startBtn.setStyle({ fill: '#fff' }))
		.on('pointerup', () => this.startGame());
		this._widgets.push(startBtn);
	
		if (this.mode === GameMode.single) {
			this.difficulty = GameDifficulty.medium;

			this._widgets.push(
				new TextWidget(
					this,
					this.scale.width * 0.25,
					this.scale.height * 0.63,
					'difficulty'
			));
			
			const easyModeToggle = new TextWidget(
				this,
				this.scale.width * 0.55,
				this.scale.height * 0.63,
				'EASY',
				8
			).setStroke("#f00", 2)
			.setInteractive()
			.on('pointerup', () => {
				this.difficulty = GameDifficulty.easy;
				easyModeToggle.setStyle({ fill: '#d7263d' });
				mediumModeToggle.setStyle({ fill: '#fff' });
				hardModeToggle.setStyle({ fill: '#fff' });
			});
			this._widgets.push(easyModeToggle);

			const mediumModeToggle = new TextWidget(
				this,
				this.scale.width * 0.675,
				this.scale.height * 0.63,
				'MEDIUM',
				8,
				'#d7263d'
			).setStroke("#f00", 2)
			.setInteractive()
			.on('pointerup', () => {
				this.difficulty = GameDifficulty.medium;
				easyModeToggle.setStyle({ fill: '#fff' });
				mediumModeToggle.setStyle({ fill: '#d7263d' });
				hardModeToggle.setStyle({ fill: '#fff' });
			});
			this._widgets.push(mediumModeToggle);

			const hardModeToggle = new TextWidget(
				this,
				this.scale.width * 0.8,
				this.scale.height * 0.63,
				'HARD',
				8
			).setStroke("#f00", 2)
			.setInteractive()
			.on('pointerup', () => {
				this.difficulty = GameDifficulty.hard;
				easyModeToggle.setStyle({ fill: '#fff' });
				mediumModeToggle.setStyle({ fill: '#fff' });
				hardModeToggle.setStyle({ fill: '#d7263d' });
			});
			this._widgets.push(hardModeToggle);
		}

		const goHomeButton = new TextWidget(
			this,
			this.scale.width * 0.9,
			this.scale.height * 0.9,
			'Home'
		)
		.setInteractive()
		.on('pointerover', () => goHomeButton.setStyle({ fill: '#FFA500' })) // Change color on hover
		.on('pointerout', () => goHomeButton.setStyle({ fill: '#fff' })) // Change color back when not hovered
		.on('pointerup', () => this.switchScene('MainMenu')); // Start the main game
		this._widgets.push(goHomeButton);
	}

	// createTogglePowerUp(x: number, y: number, value: PowerUpSelected): void {
  //   const toggleWidth = this.scale.width * 0.07; // Toggle width
  //   const toggleHeight = this.scale.height * 0.03; // Toggle height
  //   const borderRadius = toggleHeight / 2; // Half height for full rounding
  //   const knobRadius = toggleHeight * 0.8; // Slightly smaller for a better fit

  //   const toggleX = x + this.scale.width * 0.3; // Toggle's center X position
  //   const leftX = toggleX - (toggleWidth / 2) + borderRadius; // Leftmost knob position
  //   const rightX = toggleX + (toggleWidth / 2) - borderRadius; // Rightmost knob position

  //   // Draw the toggle background (rounded rectangle)
  //   const toggleGraphics = this.add.graphics();
  //   const drawToggle = (isActive: boolean) => {
  //       toggleGraphics.clear();
  //       toggleGraphics.fillStyle(isActive ? 0x3bb273 : 0xd2d2cf, 1); // Green if active, Red if inactive
  //       toggleGraphics.fillRoundedRect(toggleX - toggleWidth / 2, y - toggleHeight / 2, toggleWidth, toggleHeight, borderRadius);
  //   };

  //   drawToggle(false); // Default to inactive state

  //   // Create the circular knob
  //   const knob = this.add.circle(leftX, y, knobRadius, 0xffffff)
  //       .setOrigin(0.5, 0.5)
  //       .setInteractive();

  //   // Function to update toggle state
  //   const updateToggle = () => {
  //       const isActive = !(this.powerUpSelection & value);
  //       this.powerUpSelection = isActive ? (this.powerUpSelection | value) : (this.powerUpSelection & ~value);
        
  //       this.tweens.add({
  //           targets: knob,
  //           x: isActive ? rightX : leftX, // Move knob left or right
  //           duration: 200,
  //           ease: 'Power2'
  //       });

  //       drawToggle(isActive); // Redraw background with correct color
  //   };

  //   // Make it interactive
  //   knob.on('pointerup', updateToggle);
  //   toggleGraphics.setInteractive(new Phaser.Geom.Rectangle(toggleX - toggleWidth / 2, y - toggleHeight / 2, toggleWidth, toggleHeight), Phaser.Geom.Rectangle.Contains)
  //       .on('pointerup', updateToggle);
	// }

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
