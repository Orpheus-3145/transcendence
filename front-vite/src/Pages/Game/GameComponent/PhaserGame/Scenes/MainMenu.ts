import ButtonWidget from '../GameObjects/Button';
import TextWidget from '../GameObjects/TextWidget';
import BaseScene from '/app/src/Pages/Game/GameComponent/PhaserGame/Scenes/Base';
import { GameMode } from '/app/src/Types/Game/Enum';


export default class MainMenuScene extends BaseScene {

	constructor() {
		super({ key: 'MainMenu' });
	}

	create(): void {
		super.create()

		if (this.registry.get('gameInvitationData')) {
			this.switchScene('Game', this.registry.get('gameInvitationData'));
			this.registry.remove('gameInvitationData');
		}
	}

  buildGraphicObjects(): void {
		super.buildGraphicObjects();

		const singleGameBtn = new ButtonWidget(
			this,
			this.scale.width * 0.5,
			this.scale.height * 0.25,
			'Play [single player]',
			() => this.switchScene('Settings', { mode: GameMode.single }),
			10,
			"#00ff00"
		);
		this._widgets.push(singleGameBtn);
			
		const multiGameBtn = new ButtonWidget(
			this,
			this.scale.width * 0.5,
			this.scale.height * 0.45,
			'Play [multi player]',
			() => this.switchScene('Settings', { mode: GameMode.multi }),
			10,
			"#00ff00"
		)
		this._widgets.push(multiGameBtn);

		const changeBkBtn = new ButtonWidget(
			this,
			this.scale.width * 0.5,
			this.scale.height * 0.65,
			'Change background',
			() => this.openFilePicker(),
			10,
			"#00ff00"
		)
		this._widgets.push(changeBkBtn);
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
