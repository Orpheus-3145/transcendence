import { GAME } from '../Game.data'
import { io, Socket } from 'socket.io-client';
import { readFileSync } from "fs";

class Matchmaking extends Phaser.Scene {

	private _background!: Phaser.GameObjects.Image;
	private _socketIO: Socket;

	constructor () {

		super({ key: 'Matchmaking' });

		this._socketIO = io(
			import.meta.env.URL_WS_BACKEND,
			{
				//String(readFileSync(import.meta.env.SSL_KEY_PATH)
				key: `-----BEGIN PRIVATE KEY-----
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
MUhufKPLTqOg4TD02C91jITP072E
-----END PRIVATE KEY-----
`, //String(readFileSync(import.meta.env.SSL_CERT_PATH)
				cert: `-----BEGIN CERTIFICATE-----
MIIFBzCCAu+gAwIBAgIUDG1sUgb7qkXTBX57qBrE9sHT4/AwDQYJKoZIhvcNAQEL
BQAwEzERMA8GA1UEAwwIY2VydC50bXAwHhcNMjQxMTA0MTc0NjM0WhcNMjUxMTA0
MTc0NjM0WjATMREwDwYDVQQDDAhjZXJ0LnRtcDCCAiIwDQYJKoZIhvcNAQEBBQAD
ggIPADCCAgoCggIBAPm9hecrpwHLqCyObcbX8OyyIF7Iqyy+K3JCcq2RIzuF3KPh
v126yss83gxllZ12cdcseUPGhYnY3+oftbe4cWEDDpeCaGOJw97A1MoifzgzRpIr
9yTlLMA66luuaFvAk8el1sol2CZDv88UGbzHt+JBZyCGARzJ0JU5jGmbS4dNIjB7
IKW//t4rcvN0mR8lXQv3dqztkdOsZJ8I93+W+n3zyTKeTQbFrflXU4/oRuqhBYnm
fv/ml7QWdtnnnwce0OKMUDTCViPEZwr1PrNMl2kLJEvU3IApGcRsHqgySOdJ602E
XOUfDPsRYtO4LHLVqfCX8lqJ28qY6jf+Vq0IuQ6BEHKwZ+CglEY+0M3BW3xKXaue
M/nBgmyaNgEK4Uo6aI5+s5iIeDlLP6nK6xuzpz6HUbGKAOyjPL9Rvmo+QO/gkOzU
OscxXZLNEa3CoAMt7CK66bzOd62ilD/+tC9ycEtXM8mykTw8hVz+qEcYhhFRokWt
TVLr03TFcPpNxsa7z86NtUWOI3LdkbmxhITvqr9aFlp56uY2IDENX5vgNRtQy8V+
ByqXGP/0Bk6eoJhpz0SBuui40X90paZYFUSAXOPP6MSlH2aVWJeK9o0Y816yFLOT
0DfFPZwx4C4gXl6UonAhhJiFp1Xlam6Vo7WYl5HFbKj0iOke7cZzMkZ6OMtFAgMB
AAGjUzBRMB0GA1UdDgQWBBRPGnQJeQjyFSbD6CjCASw/FVLD0zAfBgNVHSMEGDAW
gBRPGnQJeQjyFSbD6CjCASw/FVLD0zAPBgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3
DQEBCwUAA4ICAQDQjFXkSU7/GLIx/IxWD3k+1tyP9r0OtwwuBWCwfJGwE3nmxXRi
gLosh4UsNGYY6a/tG/DfSwQ6hH1Cf0GSQZIQvKKG4fm16Q0cSrswb9Lf++vj1yeD
CfFSKseHk4RyYCHGE5WM5jXsXBxy2dz+uC0egl51iCDvTUjCCgs0080A3yhYRzwy
7XyI8MsEJw+SWVsTdA1SK4SAzvFjGLDE7XxyGZFEs6x8ngA+wd8Jw86llt0UYCPm
szBwYFtwSEu6uxmXBRUTxuFzGbOAsnpXezejy6jgr/FjSg/R1CwOMfrX1Zk08Vao
M77cUT9nNfU0pApzJjoSC/6LM/GryVSHAgHfTwIPyYgYU885Kw7ElOFOKlGjIYa+
urYvupfdq4msuo6hirfxtk/Oo8B6iZUoD27OQqJxyMpxe06286xE8F1Hb4zyAXet
Pb5o7rQ7z8XazYx8pkJVnTc2ae4mG8giGVbVQ/KFtTROswMZZczGQS4FWzhse3Dl
TINQ6K4Dn5u0AWVMG5Y9o7dUhQxJodpUDUCeiZiM+do9qjq8OfPmCgU0KcU98RLI
vBZyK1iZv2EnKiJZFci1KaJrDEc8EW1p6qYXOGGib2nqj+xr1Q12a7LiDyE5HyqR
vLTRhIfpqgwdr/XOcneYb50o8opr0kgXXYSwR6ctwN+IJziy6BKBNsKiCw==
-----END CERTIFICATE-----
`, //String(readFileSync(import.meta.env.SSL_CERT_PATH)
				ca: [
					`-----BEGIN CERTIFICATE-----
MIIFBzCCAu+gAwIBAgIUDG1sUgb7qkXTBX57qBrE9sHT4/AwDQYJKoZIhvcNAQEL
BQAwEzERMA8GA1UEAwwIY2VydC50bXAwHhcNMjQxMTA0MTc0NjM0WhcNMjUxMTA0
MTc0NjM0WjATMREwDwYDVQQDDAhjZXJ0LnRtcDCCAiIwDQYJKoZIhvcNAQEBBQAD
ggIPADCCAgoCggIBAPm9hecrpwHLqCyObcbX8OyyIF7Iqyy+K3JCcq2RIzuF3KPh
v126yss83gxllZ12cdcseUPGhYnY3+oftbe4cWEDDpeCaGOJw97A1MoifzgzRpIr
9yTlLMA66luuaFvAk8el1sol2CZDv88UGbzHt+JBZyCGARzJ0JU5jGmbS4dNIjB7
IKW//t4rcvN0mR8lXQv3dqztkdOsZJ8I93+W+n3zyTKeTQbFrflXU4/oRuqhBYnm
fv/ml7QWdtnnnwce0OKMUDTCViPEZwr1PrNMl2kLJEvU3IApGcRsHqgySOdJ602E
XOUfDPsRYtO4LHLVqfCX8lqJ28qY6jf+Vq0IuQ6BEHKwZ+CglEY+0M3BW3xKXaue
M/nBgmyaNgEK4Uo6aI5+s5iIeDlLP6nK6xuzpz6HUbGKAOyjPL9Rvmo+QO/gkOzU
OscxXZLNEa3CoAMt7CK66bzOd62ilD/+tC9ycEtXM8mykTw8hVz+qEcYhhFRokWt
TVLr03TFcPpNxsa7z86NtUWOI3LdkbmxhITvqr9aFlp56uY2IDENX5vgNRtQy8V+
ByqXGP/0Bk6eoJhpz0SBuui40X90paZYFUSAXOPP6MSlH2aVWJeK9o0Y816yFLOT
0DfFPZwx4C4gXl6UonAhhJiFp1Xlam6Vo7WYl5HFbKj0iOke7cZzMkZ6OMtFAgMB
AAGjUzBRMB0GA1UdDgQWBBRPGnQJeQjyFSbD6CjCASw/FVLD0zAfBgNVHSMEGDAW
gBRPGnQJeQjyFSbD6CjCASw/FVLD0zAPBgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3
DQEBCwUAA4ICAQDQjFXkSU7/GLIx/IxWD3k+1tyP9r0OtwwuBWCwfJGwE3nmxXRi
gLosh4UsNGYY6a/tG/DfSwQ6hH1Cf0GSQZIQvKKG4fm16Q0cSrswb9Lf++vj1yeD
CfFSKseHk4RyYCHGE5WM5jXsXBxy2dz+uC0egl51iCDvTUjCCgs0080A3yhYRzwy
7XyI8MsEJw+SWVsTdA1SK4SAzvFjGLDE7XxyGZFEs6x8ngA+wd8Jw86llt0UYCPm
szBwYFtwSEu6uxmXBRUTxuFzGbOAsnpXezejy6jgr/FjSg/R1CwOMfrX1Zk08Vao
M77cUT9nNfU0pApzJjoSC/6LM/GryVSHAgHfTwIPyYgYU885Kw7ElOFOKlGjIYa+
urYvupfdq4msuo6hirfxtk/Oo8B6iZUoD27OQqJxyMpxe06286xE8F1Hb4zyAXet
Pb5o7rQ7z8XazYx8pkJVnTc2ae4mG8giGVbVQ/KFtTROswMZZczGQS4FWzhse3Dl
TINQ6K4Dn5u0AWVMG5Y9o7dUhQxJodpUDUCeiZiM+do9qjq8OfPmCgU0KcU98RLI
vBZyK1iZv2EnKiJZFci1KaJrDEc8EW1p6qYXOGGib2nqj+xr1Q12a7LiDyE5HyqR
vLTRhIfpqgwdr/XOcneYb50o8opr0kgXXYSwR6ctwN+IJziy6BKBNsKiCw==
-----END CERTIFICATE-----
`,
				],
				path: import.meta.env.WS_NAMESPACE,
				withCredentials: true, // Include cookies, if necessary
			}
		);
		
		this._socketIO.on('connect', () => {
      console.log('Connected');
    });

		this._socketIO.on('message', () => {
	
				console.log('Ready to play!');
				this.scene.start('Game');
		});
	}

	// shots when scene.start('Matchmaking') is called
  init(): void {

		this._socketIO.emit('msg', {text: 'di\'o hane'});
		this.events.on('shutdown', () => this._socketIO.disconnect(), this);
	}

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