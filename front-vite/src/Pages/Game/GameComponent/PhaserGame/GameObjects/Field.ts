import GameScene from '/app/src/Pages/Game/GameComponent/PhaserGame/Scenes/Game';


class Field {
	// Player info
	private _leftScore: number = 0;
	private _rightScore: number = 0;

	// Phaser objects
	private readonly _scene: GameScene; // Main scene-container
	private readonly _scoreText: Phaser.GameObjects.Text; // Score display text object
	
	private readonly _textFontRatio: number = Number(import.meta.env.GAME_FONT_SIZE_RATIO);

	// Constructor initializes the scene and sets up score display
	constructor(scene: GameScene) {
		this._scene = scene;

		// Initialize the score display at the top center of the game screen
		this._scoreText = this._scene.add
			.text(this._scene.scale.width * 0.5, this._scene.scale.height * 0.1, `${this._leftScore} : ${this._rightScore}`, {
				fontSize: `${Math.round(this._textFontRatio * this._scene.scale.width)}px`,
				align: 'center',
				color: '#FFA500',
			})
			.setOrigin(0.5, 0.5);
	}

	// Sets the score and updates the display immediately
	updateScore(left: number, right: number): void {
		this._leftScore = left;
		this._rightScore = right;
		this._scoreText.text = `${this._leftScore} : ${this._rightScore}`;
	}
}

export default Field;
