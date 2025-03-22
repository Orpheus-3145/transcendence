import TextWidget from './TextWidget';


export default class Field extends TextWidget {
	private _leftScore: number = 0;
	private _rightScore: number = 0;

	constructor(scene: Phaser.Scene) {
		super(
			scene,
			scene.scale.width * 0.5,
			scene.scale.height * 0.1,
			`0 : 0`,
			0,
			'#FFA500'
		)
	}

	updateScore(left: number, right: number): void {
		this._leftScore = left;
		this._rightScore = right;
		this.text = `${this._leftScore} : ${this._rightScore}`;
	}

}
