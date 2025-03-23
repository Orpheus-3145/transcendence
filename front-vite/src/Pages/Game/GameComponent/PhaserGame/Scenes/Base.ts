import Resizable from "../GameObjects/Resizable";

export default class BaseScene extends Phaser.Scene {
	
	protected _keyEsc: Phaser.Input.Keyboard.Key | null = null;
	protected _widgets: Array<Resizable> = [];
	
	constructor(arg?: any) {
		super(arg);
	}

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
	}

	// function called by Phaser engine once every frame
	// @param time: absolute time (in ms) since the start of the scene
	// @param delta: amount of time (in ms) passed since last time time update() was called
	update(time: number, delta: number): void {

		if (this._keyEsc!.isDown) this.switchScene('MainMenu');
	}

	// method to call whenever the scene is switched
	switchScene(sceneName: string, initSceneData?: any): void {

		this._widgets = [];
		this.scene.start(sceneName, initSceneData);
	}

	buildGraphicObjects(): void {}

	resizeObects(old_width: number, old_height: number): void {

		for (const widget of this._widgets)
			widget.resize(old_width, old_height);
	}

	disconnect(): void {}
};