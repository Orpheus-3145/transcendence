import { GAME } from '../Game.data';

export default class BaseScene extends Phaser.Scene {
	
	protected _background!: Phaser.GameObjects.Image;
	protected _keyEsc!: Phaser.Input.Keyboard.Key;
	
	// ratio between standard size of the standard font size and the game window 
	// if the windows is resized, the font size is derivated from new_size_wdth * ratio
	protected readonly _textFontRatio: number = Number(import.meta.env.GAME_FONT_SIZE_RATIO);

	constructor(arg?: any) {
		super(arg);
	}

	init(arg?: any): void {

		this._keyEsc = this.input.keyboard!.addKey(
			Phaser.Input.Keyboard.KeyCodes.ESC,
		) as Phaser.Input.Keyboard.Key;
	}

	// loading graphic assets, fired after init()
	preload(arg?: any): void {
		this.load.image('background', GAME.background);
	}

	// run after preload(), creation of the elements of the menu
	create(arg?: any): void {

		this._background = this.add.image(this.scale.width * 0.5, this.scale.height * 0.5, 'background');
		this._background.setDisplaySize(this.scale.width, this.scale.height);

		this.buildGraphicObjects();
	}

	switchScene(sceneName: string, initSceneData?: any) {

		this.onPreLeave();

		this.scene.start(sceneName, initSceneData);
	}

	// the phaser objects will have to be definied
	// inside the override of this function in the sub-classes
	buildGraphicObjects(): void {}

	// method to call whenever the scene is switched
	onPreLeave() {}

	update(arg?: any) {

		if (this._keyEsc.isDown) this.switchScene('MainMenu');
	}
};