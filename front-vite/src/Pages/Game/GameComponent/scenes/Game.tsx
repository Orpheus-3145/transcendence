// import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { GAME, GAME_BALL, GAME_BAR } from '../GameData'

export default class Game extends Scene
{
	// private background: Phaser.GameObjects.Image = null!;
	private leftBar!: Phaser.Physics.Arcade.Body;
	private rightBar!: Phaser.Physics.Arcade.Body;
	private ball!: Phaser.Physics.Arcade.Body;
	private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
	private keyW!: Phaser.Input.Keyboard.Key;
	private keyS!: Phaser.Input.Keyboard.Key;
	private keyEsc!: Phaser.Input.Keyboard.Key;
	private leftScore: number = 0;
	private rightScore: number = 0;
	private scoreText: Phaser.GameObjects.Text | null = null;

	constructor () {

		super({ key: 'Game' })
	}

	openErrorpage({ trace }: { trace: string }) {

		this.scene.start('Error');
	}

	resetBallAndBars() {

		const random_x = Phaser.Math.FloatBetween( Math.sqrt(3) / 2, 1 );		// between [rad(3)/2, 1] = [cos(+-30), cos(0)]
		const random_y = Phaser.Math.FloatBetween( -0.5, 0.5 );							// between [-1/2, 1/2] = [sin(-30), sin(30)]
		const random_direction = Math.random() < 0.5 ? -1 : 1;							// random between -1 and 1
		this.ball.reset(GAME.width / 2, GAME.height / 2);										// set in the center of the map
		this.ball.setVelocity( GAME_BALL.start_speed * random_x * random_direction, GAME_BALL.start_speed * random_y);
		
		this.leftBar.reset(GAME_BAR.width / 2 * -1, GAME.height / 2);							// left bar
		this.rightBar.reset(GAME.width - GAME_BAR.width / 2, GAME.height / 2);		// right bar

		if (this.scoreText)
			this.scoreText.destroy();

		this.scoreText = this.add.text(GAME.width / 2, 50, `${this.leftScore} : ${this.rightScore}`, {
			fontSize: '32px',
			align: 'center',
			color: '#0f0',
		}).setOrigin(0.5, 0.5);

	}

	preload() {

	}

	create() {

		const shapeBall = this.add.circle(0, 0, GAME_BALL.radius, 0xff0000);
		this.ball = this.physics.add.existing(shapeBall).body as Phaser.Physics.Arcade.Body;
		this.ball.setBounce(1);
		this.ball.setCollideWorldBounds(true);
		
		const leftSide = this.physics.add.body(1, 1, 1, GAME.height * 2)
		leftSide.setImmovable();
		this.physics.add.collider(leftSide, this.ball, () => {
			this.leftScore += 1;
			this.resetBallAndBars();
		});
		
		const rightSide = this.physics.add.body(GAME.width - 1, 1, 1, GAME.height * 2)
		rightSide.setImmovable();
		this.physics.add.collider(rightSide, this.ball, () => {
			this.rightScore += 1;
			this.resetBallAndBars();
		});
	
		const shapeBar1 = this.add.rectangle(0, 0, GAME_BAR.width, GAME_BAR.height, 0xff0000);
		this.leftBar = this.physics.add.existing(shapeBar1).body as Phaser.Physics.Arcade.Body;
		this.physics.add.collider(this.leftBar, this.ball);
		this.leftBar.setBounce(1);
		this.leftBar.setImmovable();
		this.leftBar.setCollideWorldBounds(true);

		const shapeBar2 = this.add.rectangle(0, 0, GAME_BAR.width, GAME_BAR.height, 0xff0000);
		this.rightBar = this.physics.add.existing(shapeBar2).body as Phaser.Physics.Arcade.Body;
		this.physics.add.collider(this.rightBar, this.ball);
		this.rightBar.setBounce(1);
		this.rightBar.setImmovable();
		this.rightBar.setCollideWorldBounds(true);
		
		this.resetBallAndBars()
		
		// keybindings
		this.cursors = this.input?.keyboard?.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;
		this.keyW = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W) as Phaser.Input.Keyboard.Key;
		this.keyS = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S) as Phaser.Input.Keyboard.Key;
		this.keyEsc = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC) as Phaser.Input.Keyboard.Key;		
	}
	
	update( time: number, delta: number ) {

		if ( this.cursors.up.isDown || this.keyW.isDown ) {
			
			if (this.leftBar.y > 0) 
				this.leftBar.y -= 10;
			if (this.rightBar.y > 0)
				this.rightBar.y -= 10;
		}
		else if ( this.cursors.down.isDown || this.keyS.isDown ) {
			
			if ((this.leftBar.y + this.leftBar.height) < GAME.height)
				this.leftBar.y += 10;
			if ((this.rightBar.y + this.rightBar.height) < GAME.height)
				this.rightBar.y += 10;
		}
		else if ( this.keyEsc.isDown ) {
			
			this.scene.start('MainMenu');
		}
	}
}
