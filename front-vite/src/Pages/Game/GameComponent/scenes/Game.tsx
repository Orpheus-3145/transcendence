// import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, BALL_START_SPEED } from '../GameData'

export default class Game extends Scene
{
  // private background: Phaser.GameObjects.Image = null!;
  private bar1!: Phaser.Physics.Arcade.Body;
  private bar2!: Phaser.Physics.Arcade.Body;
  private ball!: Phaser.Physics.Arcade.Body;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private keyEsc!: Phaser.Input.Keyboard.Key;

  constructor () {

    super({ key: 'Game' })
  }

  openErrorpage({ trace }: { trace: string }) {

    this.scene.start('Error');
  }

  preload() {

  }

  create() {

    const shapeBar1 = this.add.rectangle(0 + 12.5, GAME_HEIGHT / 2, 25, 250, 0xff0000);
    const shapeBar2 = this.add.rectangle(GAME_WIDTH - 12.5, GAME_HEIGHT / 2, 25, 250, 0xff0000);
    const shapeBall = this.add.circle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 25, 0xff0000);
    this.bar1 = this.physics.add.existing(shapeBar1).body as Phaser.Physics.Arcade.Body;
    this.bar2 = this.physics.add.existing(shapeBar2).body as Phaser.Physics.Arcade.Body;
    this.ball = this.physics.add.existing(shapeBall).body as Phaser.Physics.Arcade.Body;
    this.physics.add.collider(this.bar1, this.ball);
    this.physics.add.collider(this.bar2, this.ball);
    this.bar1.setBounce(1);
    this.bar2.setBounce(1);
    this.ball.setBounce(1);
    this.bar1.setCollideWorldBounds(true);
    this.bar2.setCollideWorldBounds(true);
    this.ball.setCollideWorldBounds(true);
    
    // keybindings
    this.cursors = this.input?.keyboard?.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;

    this.keyW = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W) as Phaser.Input.Keyboard.Key;
    this.keyS = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S) as Phaser.Input.Keyboard.Key;
    this.keyEsc = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC) as Phaser.Input.Keyboard.Key;

    // start the game (ball goes randomly left or right - could do it better than that)
    const random_theta = Phaser.Math.FloatBetween(0, Math.PI * 2);
    this.ball.setVelocity( BALL_START_SPEED * Math.cos(random_theta), BALL_START_SPEED * Math.sin(random_theta) )
  }
  
  update( time: number, delta: number ) {

    if ( this.cursors.up.isDown || this.keyW.isDown ) {

      this.bar1.y -= 10;
      this.bar2.y -= 10;
    }
    else if ( this.cursors.down.isDown || this.keyS.isDown ) {
      
      this.bar1.y += 10;
      this.bar2.y += 10;
    }
    else if ( this.keyEsc.isDown ) {
      
      this.scene.start('MainMenu');
    }
  }
}
