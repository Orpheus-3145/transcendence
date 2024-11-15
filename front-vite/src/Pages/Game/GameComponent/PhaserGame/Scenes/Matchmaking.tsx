import { GAME } from '../Game.data'
import { io, Socket } from 'socket.io-client';
class Matchmaking extends Phaser.Scene {

	private _background!: Phaser.GameObjects.Image;
	private _socketIO!: Socket;

	constructor () {

		super({ key: 'Matchmaking' });

		this._socketIO = io(
			import.meta.env.URL_WS_BACKEND + import.meta.env.WS_NS_MATCHMAKING,
			{
				// key: String(readFileSync(import.meta.env.SSL_KEY_PATH)),
				// cert: String(readFileSync(import.meta.env.SSL_CERT_PATH)), //String(readFileSync(import.meta.env.SSL_CERT_PATH)
				// ca: [
				// 	String(readFileSync(import.meta.env.SSL_CERT_PATH)),
				// ],
				// path: import.meta.env.WS_NAMESPACE,
				withCredentials: true, // Include cookies, if necessary
				transports: ['websocket'],
  			// path: "/"
				// secure: true, // Assicura che la connessione sia sicura
			}
		);
		this._socketIO.connect()
		console.log(this._socketIO);
		
		this._socketIO.on('connect', () => {
      console.log('Connected');
    });

		this._socketIO.on('message', () => {
	
				console.log('Ready to play!');
				this.scene.start('Game');
		});
	}

	// executed when scene.start('Matchmaking') is called
  init(): void {
	
		this._socketIO = io(
			import.meta.env.URL_WS_MATCHMAKING, 
			{
				withCredentials: true,
				transports: ['websocket'],
			}
		);

		this.events.on('shutdown', () => this._socketIO.disconnect(), this);

		this._socketIO.on('ready', () => {
	
			console.log('Ready to play!');
			this.scene.start('Game');
		});
	};

	// loading graphic assets, fired after init()
  preload(): void {}

	// run after preload(), creation of the elements of the menu
  create(): void {

		// sets the background
		this._background = this.add.image(GAME.width / 2, GAME.height / 2, 'background');
		this._background.setDisplaySize(this.scale.width, this.scale.height);
    
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
		goHomeButton.on('pointerup', () => this.scene.start('MainMenu'));
  }

  // run every frame update
  update(): void {}
};

export default Matchmaking;