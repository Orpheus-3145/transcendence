import BaseScene from './Base';
import { GameMode } from '../../Types/enum';


export default class MainMenuScene extends BaseScene {

	constructor() {
		super({ key: 'MainMenu' });
	}

  buildGraphicObjects(): void {
		super.buildGraphicObjects();

		const singleGameBtn = this.add
		.text(this.scale.width * 0.5, this.scale.height * 0.2, 'Play [single player]', {
			fontSize: `${Math.round(this._textFontRatio * this.scale.width)}px`,
			align: 'center',
			color: '#fff',
		})
		.setOrigin(0.5, 0.5)
		.setInteractive()
		.on('pointerover', () => singleGameBtn.setStyle({ fill: '#ff0' }))	// Change color on hover
		.on('pointerout', () => singleGameBtn.setStyle({ fill: '#fff' }))
		.on('pointerup', () =>
			this.switchScene('Settings', { mode: GameMode.single }),
		);

		const multiGameBtn = this.add
		.text(this.scale.width * 0.5, this.scale.height * 0.3, 'Play [multi player]', {
			fontSize: `${Math.round(this._textFontRatio * this.scale.width)}px`,
			align: 'center',
			color: '#fff',
		})
		.setOrigin(0.5, 0.5)
		.setInteractive()
		.on('pointerover', () => multiGameBtn.setStyle({ fill: '#ff0' }))	// Change color on hover
		.on('pointerout', () => multiGameBtn.setStyle({ fill: '#fff' }))
		.on('pointerup', () =>
			this.switchScene('Settings', { mode: GameMode.multi }),
		);
	}
}
