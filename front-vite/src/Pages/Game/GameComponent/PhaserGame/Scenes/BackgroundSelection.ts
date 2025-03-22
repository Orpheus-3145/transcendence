import { v4 as uuidv4 } from 'uuid';

import BaseScene, { GlobalEvents } from './Base';
import { AnimationSelected } from '../../../../../Types/Game/Enum';
import MovingLines from './Animations/MovingLines';
import ParticleEmitter from './Animations/ParticleEmitter';
import ParticleSystem from './Animations/ParticleSystem';


export default class BackgroundSelectionScene extends BaseScene {
	
	constructor() {
		super({ key: 'BackgroundSelection' });
	}

	// init(): void {
	// 	super.init();
	// }

	// create(): void {
	// 	super.create();
	// 	if (!this._animation) {
	// 		this.createAnimation();
	// 	}
	// }

	// update(): void {
	// 	if (this._animation) {
	// 		this._animation.update();
	// 	}
	// }

	buildGraphicObjects(): void {
		super.buildGraphicObjects();

		const movingLines = this.add
		.text(this.scale.width * 0.5, this.scale.height * 0.2, 'Moving Lines', {
			fontSize: `${Math.round(this._textFontRatio * this.scale.width)}px`,
			align: 'center',
			color: '#fff',
		})
		.setOrigin(0.5, 0.5)
		.setInteractive()
		.on('pointerover', () => movingLines.setStyle({ fill: '#FFA500' }))	// Change color on hover
		.on('pointerout', () => movingLines.setStyle({ fill: '#fff' }))
		.on('pointerup', () =>
			this.handleChange(AnimationSelected.movingLines)
		);
	
		const particlesEmitter = this.add
		.text(this.scale.width * 0.5, this.scale.height * 0.3, 'Particle Emitters', {
			fontSize: `${Math.round(this._textFontRatio * this.scale.width)}px`,
			align: 'center',
			color: '#fff',
		})
		.setOrigin(0.5, 0.5)
		.setInteractive()
		.on('pointerover', () => particlesEmitter.setStyle({ fill: '#FFA500' }))	// Change color on hover
		.on('pointerout', () => particlesEmitter.setStyle({ fill: '#fff' }))
		.on('pointerup', () =>
			this.handleChange(AnimationSelected.particleEmitter)
		);

		const particleSystem = this.add
		.text(this.scale.width * 0.5, this.scale.height * 0.4, 'Particle System', {
			fontSize: `${Math.round(this._textFontRatio * this.scale.width)}px`,
			align: 'center',
			color: '#fff',
		})
		.setOrigin(0.5, 0.5)
		.setInteractive()
		.on('pointerover', () => particleSystem.setStyle({ fill: '#FFA500' }))	// Change color on hover
		.on('pointerout', () => particleSystem.setStyle({ fill: '#fff' }))
		.on('pointerup', () =>
			this.handleChange(AnimationSelected.particleSystem)
		);

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
			.on('pointerup', () => this.switchScene('MainMenu')); 
	}

	handleChange(animationSelected: AnimationSelected): void {
		if (animationSelected === this._animationSelected){
			return ;
		}
		GlobalEvents.emit('animationChanged', animationSelected);
		console.log(`Handling change to: ${animationSelected}`);
		console.log(`from ${this._animationSelected}`);
		this.changeAnimation(animationSelected);
		this.createAnimation();
	}
}
