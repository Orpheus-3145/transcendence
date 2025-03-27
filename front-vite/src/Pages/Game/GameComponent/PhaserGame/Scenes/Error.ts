import ButtonWidget from '../GameObjects/Button';
import TextWidget from '/app/src/Pages/Game/GameComponent/PhaserGame/GameObjects/TextWidget';
import BaseScene from '/app/src/Pages/Game/GameComponent/PhaserGame/Scenes/Base';


export default class ErrorScene extends BaseScene {
	private _errorTrace: string = '';

	constructor() {
		super({ key: 'Error' });
	}

	buildGraphicObjects(): void {
		super.buildGraphicObjects();

		// show error description
		this._widgets.push(
			new TextWidget(
				this,
				this.scale.width * 0.5,
				this.scale.height * 0.4,
				this._errorTrace,
				18,
		));

		// go back home btn
		this._widgets.push(new ButtonWidget(
			this,
			this.scale.width * 0.9,
			this.scale.height * 0.9,
			'Home',
			() => this.switchScene('MainMenu'),
			20,
			'#00ff00'
		));
	}

}
