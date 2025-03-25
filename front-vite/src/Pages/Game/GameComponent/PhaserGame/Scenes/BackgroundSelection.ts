import axios from 'axios';
import ButtonWidget from '/app/src/Pages/Game/GameComponent/PhaserGame/GameObjects/Button';
import BaseScene from '/app/src/Pages/Game/GameComponent/PhaserGame/Scenes/Base';
import { AnimationSelected } from '/app/src/Types/Game/Enum';


export default class BackgroundSelectionScene extends BaseScene {

	constructor() {
		super({ key: 'BackgroundSelection' });
	}

	buildGraphicObjects(): void {
		super.buildGraphicObjects();

		// select animation 'Moving Lines'
		this._widgets.push(new ButtonWidget(
			this,
			this.scale.width * 0.5,
			this.scale.height * 0.25,
			'Moving Lines',
			() => this.handleChange(AnimationSelected.movingLines),
			10,
			"#00ff00"
		));
		
		// select animation 'Particle Emitters'
		this._widgets.push(new ButtonWidget(
			this,
			this.scale.width * 0.5,
			this.scale.height * 0.45,
			'Particle Emitters',
			() => this.handleChange(AnimationSelected.particleEmitter),
			10,
			"#00ff00"
		));

		// select animation 'Particle System'
		this._widgets.push(new ButtonWidget(
			this,
			this.scale.width * 0.5,
			this.scale.height * 0.65,
			'Particle System',
			() => this.handleChange(AnimationSelected.particleSystem),
			10,
			"#00ff00"
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

	// update the animation for all the other scenes
	async handleChange(animationSelected: AnimationSelected): Promise<void> {
		if (animationSelected === this._animationSelected)
			return ;

		const intraId = this.registry.get('user42data').intraId;

		try {
			const url = `${import.meta.env.URL_BACKEND}/users/profile/setGameAntimation/${intraId}/${animationSelected}`;
      await axios.post(url);
    } catch (error) {
			this.switchScene('Error', { trace: `failed to updated animation for user: ${error}`});
    }
		// updates all the other scenes with the change
		this.scene.manager.getScenes(false).forEach((scene: Phaser.Scene) => (scene as BaseScene).setAnimation(animationSelected));

		this._animationSelected = animationSelected;
		this.createAnimation();
	}
}
