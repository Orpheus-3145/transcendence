import ButtonWidget from '../GameObjects/Button';
import BaseScene from '/app/src/Pages/Game/GameComponent/PhaserGame/Scenes/Base';
import { GameMode } from '/app/src/Types/Game/Enum';

export default class MainMenuScene extends BaseScene {

	constructor() {
		super({ key: 'MainMenu' });
	}

    init(data?: any): void {
		super.init()

		if (data.animationSelected !== undefined) {
			this._animationSelected = data.animationSelected;
		}
	}

	create(): void {
		super.create();
		
		if (this.registry.get('gameInvitationData')) {
			this.switchScene('Game', {mode: this.registry.get('gameInvitationData'), animationSelected: this._animationSelected});
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
			() => this.switchScene('Settings', { mode: GameMode.single, animationSelected: this._animationSelected}),
			10,
			"#00ff00"
		);
		this._widgets.push(singleGameBtn);
			
		const multiGameBtn = new ButtonWidget(
			this,
			this.scale.width * 0.5,
			this.scale.height * 0.45,
			'Play [multi player]',
			() => this.switchScene('Settings', { mode: GameMode.multi, animationSelected: this._animationSelected}),
			10,
			"#00ff00"
		)
		this._widgets.push(multiGameBtn);

		const changeBkBtn = new ButtonWidget(
			this,
			this.scale.width * 0.5,
			this.scale.height * 0.65,
			'Change background',
			() => this.switchScene('BackgroundSelection'),
			10,
			"#00ff00"
		)
		this._widgets.push(changeBkBtn);
	}
}
