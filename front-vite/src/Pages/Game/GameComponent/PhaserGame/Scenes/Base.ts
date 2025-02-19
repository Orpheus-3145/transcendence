export default class BaseScene extends Phaser.Scene {
	
	// background image
	protected _backgroundPath: string = import.meta.env.GAME_PATH_BACKGROUND;
	protected _background: Phaser.GameObjects.Image | null = null;
	protected _keyEsc: Phaser.Input.Keyboard.Key | null = null;
	
	// ratio between standard size of the standard font size and the game window 
	// if the windows is resized, the font size is derivated from new_size_wdth * ratio
	protected readonly _textFontRatio: number = Number(import.meta.env.GAME_FONT_SIZE_RATIO);

	// constructor(arg?: any) {
	// 	super(arg);
	// }

	// method called when scene.start(nameScene, args) is run
	init(arg?: any): void {

		this._keyEsc = this.input.keyboard!.addKey(
			Phaser.Input.Keyboard.KeyCodes.ESC,
		) as Phaser.Input.Keyboard.Key;
	}

	// loading graphic assets, fired after init()
	preload(arg?: any): void {
		this.load.image('background', this._backgroundPath);
	}

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

		this.scene.start(sceneName, initSceneData);
	}

	// the phaser objects will have to be definied
	// inside the override of this function in the sub-classes
	buildGraphicObjects(): void {

		// if (this._background !== null)
		// 	return ;

		this._background = this.add.image(this.scale.width * 0.5, this.scale.height * 0.5, 'background');
		this._background.setDisplaySize(this.scale.width, this.scale.height);
	}

	killChildren(): void {

		this.children.list.forEach((gameObject) => gameObject.destroy());
	}

	disconnect(): void {}
};