import BaseAnimation from './Animations/BaseAnimation';
import MovingLines from './Animations/MovingLines';
import ParticleEmitter from './Animations/ParticleEmitter';
import ParticleSystem from './Animations/ParticleSystem';
import { AnimationSelected } from '../../../../../Types/Game/Enum';
import EventEmitter from 'eventemitter3';


// Create a shared event emitter (Singleton)
export const GlobalEvents = new EventEmitter();

// check for nulls!
export default class BaseScene extends Phaser.Scene {
	
	// background image
	protected _backgroundPath: string = import.meta.env.GAME_PATH_BACKGROUND;
	protected _background: Phaser.GameObjects.Image | null = null;
	protected _keyEsc: Phaser.Input.Keyboard.Key | null = null;	
	protected _animation: BaseAnimation | null = null;
	protected _animationSelected: number = AnimationSelected.movingLines; // Should retrieve this value from the BE based on saved preferences
	// protected _animationSelected: number = AnimationSelected.particleSystem; 

	// ratio between standard size of the standard font size and the game window 
	// if the windows is resized, the font size is derivated from new_size_wdth * ratio
	protected readonly _textFontRatio: number = Number(import.meta.env.GAME_FONT_SIZE_RATIO);

	constructor(arg?: any) {
		super(arg);
		// Listen for animation updates from other scenes
		GlobalEvents.on('animationChanged', (data: any) => {
			this.changeAnimation(data);
			// console.log('got event!', JSON.stringify(data));

		}, this);
	}

	// method called when scene.start(nameScene, args) is run
	init(arg?: any): void {
		this._keyEsc = this.input.keyboard!.addKey(
			Phaser.Input.Keyboard.KeyCodes.ESC,
		) as Phaser.Input.Keyboard.Key;
	}

	// loading graphic assets, fired after init()
	preload(arg?: any): void {
		// this.load.image('white_circle', '/assets/texture/white_circle.png');
		// this.load.image('background', this._backgroundPath);
		// this.load.glsl('ditherShader', '/assets/texture/ditherShader.glsl');
	}

	// run after preload(), creation of the entities of the scene
	create(arg?: any): void {

		this.buildGraphicObjects();
		// if (!this._animation) {
		this.createAnimation();
		// }
		// const shader = this.add.shader('ditherShader', this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height);
		// this.cameras.main.setRenderToTexture(shader);
	}

	// function called by Phaser engine once every frame
	// @param time: absolute time (in ms) since the start of the scene
	// @param delta: amount of time (in ms) passed since last time time update() was called
	update(time: number, delta: number): void {
		if (this._keyEsc!.isDown)
			this.switchScene('MainMenu');
		
		this.updateAnimation();
	}

	// method to call whenever the scene is switched
	switchScene(sceneName: string, initSceneData?: any): void {
		this.scene.switch(sceneName, initSceneData);
	}

	// the phaser objects will have to be definied
	// inside the override of this function in the sub-classes
	buildGraphicObjects(): void {

		// if (this._background !== null)
			// return ;
		// this._background = this.add.image(this.scale.width * 0.5, this.scale.height * 0.5, 'background');
		// this._background.setDisplaySize(this.scale.width, this.scale.height);
	}

	protected getAnimation(): BaseAnimation | null {
		return this._animation;
	}

	changeAnimation(animationType: AnimationSelected): void {
		this._animationSelected = animationType;
		// this.createAnimation(); // Call createAnimation to apply the change
	}

	createAnimation(): void {
		if (this._animation) {
			this._animation.destroy();
			this._animation = null;
		}
		console.log("destroyed animation and will set it to:");
		console.log(`${this._animationSelected}`);
		if (this._animationSelected === AnimationSelected.movingLines)
			this._animation = new MovingLines(this);
		else if (this._animationSelected === AnimationSelected.particleEmitter)
			this._animation = new ParticleEmitter(this);
		else if (this._animationSelected === AnimationSelected.particleSystem)
			this._animation = new ParticleSystem(this);
		this._animation?.create();
		// this.updateAnimation();
	}

	updateAnimation(): void {

		// if (this._animation) {
		this._animation!.update();
		// }
	}

	killChildren(): void {
		this.children.list.forEach((gameObject) => gameObject.destroy());
	}

	disconnect(): void {}

	destroy(): void {
		GlobalEvents.off('animationChanged', this.changeAnimation, this);
	}
};