export default class BaseScene extends Phaser.Scene {
	
	// background image
	protected _backgroundPath: string = import.meta.env.GAME_PATH_BACKGROUND;
	protected _background: Phaser.GameObjects.Image | null = null;
	protected _backgroundColor: number = 0x000000; // Black
	// protected _lines: Phaser.GameObjects.Rectangle[] = [];
	protected _keyEsc: Phaser.Input.Keyboard.Key | null = null;
	protected _lines: Phaser.GameObjects.Group | null = null;
	
	// ratio between standard size of the standard font size and the game window 
	// if the windows is resized, the font size is derivated from new_size_wdth * ratio
	protected readonly _textFontRatio: number = Number(import.meta.env.GAME_FONT_SIZE_RATIO);

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
	preload(arg?: any): void {
		// this.load.image('background', this._backgroundPath);
		// this.load.glsl('ditherShader', 'assets/texture/ditherShader.glsl');
	}

	// run after preload(), creation of the entities of the scene
	create(arg?: any): void {
		this.cameras.main.setBackgroundColor(this._backgroundColor);
		this._lines = this.add.group();
		this.time.addEvent({
			delay: 400, // Spawns a line every second
			repeat: -1,
			callback: this.spawnCluster,
			callbackScope: this
		});
		this.buildGraphicObjects();
        // const shader = this.add.shader('ditherShader', this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height);
        // this.cameras.main.setRenderToTexture(shader);
	}

	// function called by Phaser engine once every frame
	// @param time: absolute time (in ms) since the start of the scene
	// @param delta: amount of time (in ms) passed since last time time update() was called
	update(time: number, delta: number): void {

		if (this._keyEsc!.isDown) this.switchScene('MainMenu');

		// Move the lines across the screen
		// this._lines.forEach((line) => {
		// 	line.x += 5;
		// 	if (line.x > this.scale.width) {
		// 		line.destroy();
		// 		this._lines = this._lines.filter(l => l !== line);
		// 	}
		// });

		this._lines!.getChildren().forEach((line: Phaser.GameObjects.Rectangle) => {
			// line.x += 2;
			(line as any).x += (line as any).speed; // Use stored speed
			if ((line as any).x  > this.scale.width) {
				this._lines!.remove(line, true, true);
			}
		});
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

		// this._background = this.add.image(this.scale.width * 0.5, this.scale.height * 0.5, 'background');
		// this._background.setDisplaySize(this.scale.width, this.scale.height);
	}

	spawnLine(): void {
		const line = this.add.rectangle(0, Phaser.Math.Between(0, this.scale.height), 50, 2, 0xffffff);
		this._lines.push(line);
	}


	// spawnCluster(): void {

	// 	const clusterSize = Phaser.Math.Between(3, 7);
	// 	for (let i = 0; i < clusterSize; i++) {
	// 		const offsetY = Phaser.Math.Between(-20, 20);
	// 		const line = this.add.rectangle(0, Phaser.Math.Between(0, this.scale.height) + offsetY, 50, 2, 0xffffff);
	// 		this._lines.push(line);
	// 	}
	// }

	spawnCluster(): void {
		const clusterSize = Phaser.Math.Between(0.5, 3);
		const randomY = Phaser.Math.Between(30, this.scale.height - 30);
		const speed = Phaser.Math.Between(2, 5); // Random speed for each line
		for (let i = 0; i < clusterSize; i++) {
			this.time.delayedCall(Phaser.Math.Between(0, 500), () => {
				const width = Phaser.Math.Between(3, 30);
				const height = 3;
				const sign = Phaser.Math.Between(0, 1)
				let offsetY;
				if (sign)
					offsetY = Phaser.Math.Between(5, 30);
				else
					offsetY = Phaser.Math.Between(-5, -30);
				const line = this.add.rectangle(0, randomY + offsetY, width, height, 0xD3D3D3);
				(line as any).speed = speed; // Store speed in the object
				this._lines!.add(line);
			});
		}
	}

	killChildren(): void {

		this.children.list.forEach((gameObject) => gameObject.destroy());
	}

	disconnect(): void {}
};