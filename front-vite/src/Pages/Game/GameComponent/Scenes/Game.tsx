import { GAME, GAME_BALL, GAME_BAR } from '../GameData'
import Ball from '../GameObjects/Ball'
import Bar from '../GameObjects/Bar'

class Game extends Phaser.Scene {

	private leftBar!: Bar;
	private rightBar!: Bar; 
	private ball!: Ball
	private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
	private keyW!: Phaser.Input.Keyboard.Key;
	private keyS!: Phaser.Input.Keyboard.Key;
	private keyEsc!: Phaser.Input.Keyboard.Key;
	private leftScore: number = 0;
	private rightScore: number = 0;
	private scoreText: Phaser.GameObjects.Text | null = null;

	constructor () {

		super({ key: 'Game' });

	}
	
	openErrorpage({ trace }: { trace: string }) {
		
		this.scene.start('Error');
	}
	
	resetBallAndBars() {
		
		this.ball.resetPos();
		this.leftBar.resetPos();
		this.rightBar.resetPos();
		
		this.scoreText?.setText(`${this.leftScore} : ${this.rightScore}`);
	}
	
	preload() {
		
	}
	
	create() {
		
		// keybindings
		this.cursors = this.input?.keyboard?.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;
		this.keyW = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W) as Phaser.Input.Keyboard.Key;
		this.keyS = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S) as Phaser.Input.Keyboard.Key;
		this.keyEsc = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC) as Phaser.Input.Keyboard.Key;
	
		const shapeBall: Phaser.GameObjects.Arc = this.add.circle(GAME.width / 2, GAME.height / 2, GAME_BALL.radius, 0xff0000);
		this.ball = new Ball(this, shapeBall, GAME.width / 2, GAME.height / 2);

		const shapeLeftBar: Phaser.GameObjects.Rectangle = this.add.rectangle(GAME_BAR.width / 2 * -1, GAME.height / 2, GAME_BAR.width, GAME_BAR.height, 0xff0000);
		this.leftBar = new Bar(this, shapeLeftBar, GAME_BAR.width / 2 * -1, GAME.height / 2, this.ball);

		const shapeRightBar: Phaser.GameObjects.Rectangle = this.add.rectangle(GAME.width - GAME_BAR.width / 2, GAME.height / 2, GAME_BAR.width, GAME_BAR.height, 0xff0000);
		this.rightBar = new Bar(this, shapeRightBar, GAME.width - GAME_BAR.width / 2, GAME.height / 2, this.ball);

		const leftSide: Phaser.Physics.Arcade.Body = this.physics.add.body(1, 1, 1, GAME.height * 2);
		leftSide.setImmovable();
		this.physics.add.collider(leftSide, this.ball, () => {
			this.leftScore += 1;
			this.resetBallAndBars();
		});
		
		const rightSide: Phaser.Physics.Arcade.Body = this.physics.add.body(GAME.width - 1, 1, 1, GAME.height * 2);
		rightSide.setImmovable();
		this.physics.add.collider(rightSide, this.ball, () => {
			this.rightScore += 1;
			this.resetBallAndBars();
		});
		
		this.scoreText = this.add.text(GAME.width / 2, 50, '', {
			fontSize: '32px',
			align: 'center',
			color: '#0f0',
		}).setOrigin(0.5, 0.5);

		this.resetBallAndBars();
	}
	
	update() {

		if ( this.cursors.up.isDown || this.keyW.isDown ) {
			
			this.leftBar.moveUp();
			this.rightBar.moveUp();
		}
		else if ( this.cursors.down.isDown || this.keyS.isDown ) {
			
			this.leftBar.moveDown();
			this.rightBar.moveDown();
		}
		else if ( this.keyEsc.isDown ) {
			
			this.scene.start('MainMenu');
		}
	}
};

export default Game;
