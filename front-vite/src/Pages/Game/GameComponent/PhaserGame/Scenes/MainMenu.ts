import BaseScene from './Base';
import { GameMode } from '../../Types/Enum';


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

		const changeBkBtn = this.add
		.text(this.scale.width * 0.5, this.scale.height * 0.4, 'Change background', {
			fontSize: `${Math.round(this._textFontRatio * this.scale.width)}px`,
			align: 'center',
			color: '#fff',
		})
		.setOrigin(0.5, 0.5)
		.setInteractive()
		.on('pointerover', () => changeBkBtn.setStyle({ fill: '#ff0' }))	// Change color on hover
		.on('pointerout', () => changeBkBtn.setStyle({ fill: '#fff' }))
		.on("pointerdown", () => this.openFilePicker());
	}

	openFilePicker() {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = "image/*";

		input.onchange = (event: Event) => {
			const target = event.target as HTMLInputElement;
			if (target.files && target.files.length > 0) {
				const file = target.files[0];
				const reader = new FileReader();
				reader.onload = (e) => {
					if (e.target?.result)
						this.loadNewBkImage(e.target.result as string);
				};
				reader.readAsDataURL(file);
			}
		};
		input.click();
	}

	loadNewBkImage(base64: string) {
		
		if (this.textures.exists("background"))
			this.textures.remove("background");

		this.textures.once(`addtexture`, (key: string) => {
			
			if (key === "background") {
				this._background!.setTexture("background");
				this._background!.setDisplaySize(this.scale.width, this.scale.height);
			}
		})
		.addBase64("background", base64);
	}
}
