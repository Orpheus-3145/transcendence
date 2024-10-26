import { GAME } from '../Game.data'
import axios from 'axios';

class Matchmaking extends Phaser.Scene {

	private _background!: Phaser.GameObjects.Image;
	private _backendURL: string = import.meta.env.ORIGIN_URL_BACK || 'http://localhost.codam.nl:4000';
	private _startGameListener!: EventSource;

	constructor () {

		super({ key: 'Matchmaking' });
	}

	async checkPlayers() {
		try {
			const fetchedData = await axios.get(this._backendURL + '/game/matchmaking/getPlayers', { withCredentials: true });
			console.log(fetchedData.data);
		} catch (error) {};
	}

	async addPlayer() {

		try {
			await axios.get(this._backendURL + '/game/matchmaking/addPlayer', { withCredentials: true });
		} catch (error) {};
	}

	async removePlayer() {

		try {
			await axios.get(this._backendURL + '/game/matchmaking/removePlayer', { withCredentials: true });
		} catch (error) {};
	}

	// shots when scene.start('Matchmaking') is called
  init() {

		this.addPlayer();
  }

	// loading graphic assets, fired after init()
  preload(): void {}

	// run after preload(), creation of the elements of the menu
  create () {

		// sets the background
		this._background = this.add.image(GAME.width / 2, GAME.height / 2, 'background');
		this._background.setDisplaySize(this.scale.width, this.scale.height);
    
		this._startGameListener = new EventSource(this._backendURL + '/game/matchmaking');
    this._startGameListener.onmessage = (event) => {
			
			this._startGameListener.close();
			this.scene.start('Game');
    };
    this._startGameListener.onerror = (event) => {
      console.error('Errore nella connessione SSE:', event);
      this._startGameListener.close(); // Chiudi la connessione in caso di errore
    };

		this.add.text(400, 150, 'Waiting for playerz ...', {
      fontSize: '32px',
      align: 'center',
      color: '#fff',
    });
    // button for going home
		const goHomeButton = this.add.text(GAME.width - 150, GAME.height - 100, 'Home', {
			fontSize: '32px',
			align: 'center',
			color: '#fff',
		}).setInteractive();
		// Change color on hover
		goHomeButton.on('pointerover', () => goHomeButton.setStyle({ fill: '#ff0' }));
		// Change color back when not hovered
		goHomeButton.on('pointerout', () => goHomeButton.setStyle({ fill: '#fff' }));
		 // Start the main game
		goHomeButton.on('pointerup', () => {
			this.removePlayer();
			this.scene.start('MainMenu');
		});
  }

  // run every frame update
  update(): void {}
};

export default Matchmaking;