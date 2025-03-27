import ButtonWidget from '../GameObjects/Button';
import TextWidget from '/app/src/Pages/Game/GameComponent/PhaserGame/GameObjects/TextWidget';
import BaseScene from '/app/src/Pages/Game/GameComponent/PhaserGame/Scenes/Base';


export default class ErrorScene extends BaseScene {
	private errorInfo: TextWidget | null = null;

	constructor() {
		super({ key: 'Error' });
	}

	buildGraphicObjects(): void {
		super.buildGraphicObjects();

		this.errorInfo = new TextWidget(
			this,
			this.scale.width * 0.5,
			this.scale.height * 0.4,
			'',
			18,
			'#ff0000',
		)
		// show error description
		this._widgets.push(this.errorInfo);

		// go back home btn
		this._widgets.push(new ButtonWidget(
			this,
			this.scale.width * 0.9,
			this.scale.height * 0.9,
			'Home',
			() => this.switchScene('MainMenu'),
			20,
			'#dd0000'
		));
	}

	create(data: { trace: string }) {
		super.create();
		this.errorInfo?.setText(data.trace);
	}
}
