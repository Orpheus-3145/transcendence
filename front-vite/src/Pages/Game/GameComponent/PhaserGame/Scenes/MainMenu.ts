import ButtonWidget from '/app/src/Pages/Game/GameComponent/PhaserGame/GameObjects/Button';
import BaseScene from '/app/src/Pages/Game/GameComponent/PhaserGame/Scenes/Base';
import { GameMode } from '/app/src/Types/Game/Enum';

export default class MainMenuScene extends BaseScene {

	constructor() {
		super({ key: 'MainMenu' });
	}

	create(): void {
		super.create();

		if (this.registry.get('gameInvitationData')) {
			this.switchScene('Game', this.registry.get('gameInvitationData'));
			this.registry.remove('gameInvitationData');
		}
	}

	buildGraphicObjects(): void {
		super.buildGraphicObjects();

		// play single player
		this._widgets.push(new ButtonWidget(
			this,
			this.scale.width * 0.5,
			this.scale.height * 0.25,
			'Play [single player]',
			() => this.switchScene('Settings', { mode: GameMode.single }),
			10,
			"#00ff00"
		));
		
		// play multi player
		this._widgets.push(new ButtonWidget(
			this,
			this.scale.width * 0.5,
			this.scale.height * 0.45,
			'Play [multi player]',
			() => this.switchScene('Settings', { mode: GameMode.multi }),
			10,
			"#00ff00"
		));

		// change the background
		this._widgets.push(new ButtonWidget(
			this,
			this.scale.width * 0.5,
			this.scale.height * 0.65,
			'Change background',
			() => this.switchScene('BackgroundSelection'),
			10,
			"#00ff00"
		));
	}
}
