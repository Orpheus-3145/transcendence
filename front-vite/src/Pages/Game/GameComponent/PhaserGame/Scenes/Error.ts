import ButtonWidget from '../GameObjects/Button';
import TextWidget from '../GameObjects/TextWidget';
import BaseScene from '/app/src/Pages/Game/GameComponent/PhaserGame/Scenes/Base';

export default class ErrorScene extends BaseScene {
	private _errorTrace: string = '';

	constructor() {
		super({ key: 'Error' });
	}

	init(data: {trace: string, animationSelected: AnimationSelected}): void {
		super.init()
		this._errorTrace = data.trace;
		if (data.animationSelected !== undefined) {
			this._animationSelected = data.animationSelected;
		}
	}

  	buildGraphicObjects(): void {
		super.buildGraphicObjects();

		this._widgets.push(
			new TextWidget(
				this,
				this.scale.width * 0.5,
				this.scale.height * 0.4,
				this._errorTrace,
				18,
		));

		const goHomeButton = new ButtonWidget(
			this,
			this.scale.width * 0.9,
			this.scale.height * 0.9,
			'Home',
			() => this.switchScene('MainMenu', {animationSelected: this._animationSelected}),
			20,
			'#dd0000'
		)
		this._widgets.push(goHomeButton);
	}

}
