import BaseAnimation from '../Animations/BaseAnimation';
import MovingLines from '../Animations/MovingLines';
import ParticleEmitter from '../Animations/ParticleEmitter';
import ParticleSystem from '../Animations/ParticleSystem';
import { AnimationSelected } from '../../../../../Types/Game/Enum';
import Resizable from "../GameObjects/Resizable";


// check for nulls!
export default class BaseScene extends Phaser.Scene {
	
	// background image
	protected _backgroundPath: string = import.meta.env.GAME_PATH_BACKGROUND;
	protected _background: Phaser.GameObjects.Image | null = null;
	protected _keyEsc: Phaser.Input.Keyboard.Key | null = null;	
	protected _animation: BaseAnimation | null = null;
	protected _animationSelected: number = AnimationSelected.movingLines; // Should retrieve this value from the BE based on saved preferences
	protected _switchAnimation: boolean = false;
	protected _widgets: Array<Resizable> = [];

	// method called when scene.start(nameScene, args) is run
	init(arg?: any): void {
		this._keyEsc = this.input.keyboard!.addKey(
			Phaser.Input.Keyboard.KeyCodes.ESC,
		) as Phaser.Input.Keyboard.Key;
	}

	// loading graphic assets, fired after init()
	preload(arg?: any): void {}

	// run after preload(), creation of the entities of the scene
	create(arg?: any): void {
		this.buildGraphicObjects();
		this.createAnimation();
	}

	// function called by Phaser engine once every frame
	// @param time: absolute time (in ms) since the start of the scene
	// @param delta: amount of time (in ms) passed since last time time update() was called
	update(time: number, delta: number): void {
		if (this._keyEsc!.isDown)
			this.switchScene('MainMenu', {animationSelected: this._animationSelected});
		this._animation!.update();
	}

	// method to call whenever the scene is switched
	switchScene(sceneName: string, initSceneData?: any): void {
			this._widgets = [];
			this.scene.start(sceneName, initSceneData);
	}

	buildGraphicObjects(): void {}
	
	createAnimation(): void {
		if (this._animation) {
			this._animation.destroy();
			this._animation = null;
		}

		if (this._animationSelected === AnimationSelected.movingLines)
			this._animation = new MovingLines(this);
		else if (this._animationSelected === AnimationSelected.particleEmitter)
			this._animation = new ParticleEmitter(this);
		else if (this._animationSelected === AnimationSelected.particleSystem)
			this._animation = new ParticleSystem(this);
		this._animation?.create();
	}

	resizeObects(old_width: number, old_height: number): void {

		for (const widget of this._widgets)
			widget.resize(old_width, old_height);
	}

	disconnect(): void {}
};