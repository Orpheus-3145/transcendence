import BaseAnimation from '/app/src/Pages/Game/GameComponent/PhaserGame/Animations/BaseAnimation';
import MovingLines from '/app/src/Pages/Game/GameComponent/PhaserGame/Animations/MovingLines';
import ParticleEmitter from '/app/src/Pages/Game/GameComponent/PhaserGame/Animations/ParticleEmitter';
import ParticleSystem from '/app/src/Pages/Game/GameComponent/PhaserGame/Animations/ParticleSystem';
import { AnimationSelected } from '/app/src/Types/Game/Enum';
import { Resizable } from '/app/src/Types/Game/Interfaces';


export default class BaseScene extends Phaser.Scene {
	
	protected _keyEsc: Phaser.Input.Keyboard.Key | null = null;	
	protected _animation: BaseAnimation | null = null;
	protected _animationSelected: AnimationSelected | null = null; // Should retrieve this value from the BE based on saved preferences
	protected _switchAnimation: boolean = false;

	// all the objects are stored here to be properly resized
	protected _widgets: Array<Resizable> = [];

	// method called when scene.start(nameScene, args) is run
	init(arg?: any): void {
		this._keyEsc = this.input.keyboard!.addKey(
			Phaser.Input.Keyboard.KeyCodes.ESC,
		) as Phaser.Input.Keyboard.Key;

		// setting background animation
		const animation: AnimationSelected = this.registry.get('user42data').gameAnimation;
		this.setAnimation(animation);
	}

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
			this.switchScene('MainMenu');
		if (this._animation)
			this._animation.update();
	}

	// method to call whenever the scene is switched
	switchScene(sceneName: string, initSceneData?: any): void {
		this._widgets = [];
		this.scene.start(sceneName, initSceneData);
	}

	setAnimation(newAnimation: AnimationSelected): void {
		this._animationSelected = newAnimation;
	}
	
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

	// when scene's size change, update (resize) all the object inside
	// the array this._widgets
	resizeObects(old_width: number, old_height: number): void {
		for (const widget of this._widgets)
			widget.resize(old_width, old_height);
	}

	// loading graphic assets, fired after init()
	preload(arg?: any): void {}

	// create graphical objects to show on scene
	buildGraphicObjects(): void {}

	disconnect(): void {}
};