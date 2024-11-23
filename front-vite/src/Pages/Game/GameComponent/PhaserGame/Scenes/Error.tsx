class Error extends Phaser.Scene {
	// error info
	private _errorData: string = '';

	constructor() {
		super({ key: 'Error' });
	}

	// executed when scene.start('Error') is called,
	// @param trace: information about the error
	init(data: { trace: string }): void {
		this._errorData = data.trace;
	}

	// loading graphic assets, fired after init()
	preload(): void {}

	// run after preload(), shows a basic info of the error
	create(): void {
		this.add.text(400, 100, `ERROR: ${this._errorData}`, {
			fontSize: '32px',
			align: 'center',
			color: '0xff0000',
		});

		// do something else, either kill the game, reload, ...
	}

	// run every frame update
	upload(): void {}
}

export default Error;
