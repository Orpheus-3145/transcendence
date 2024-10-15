import { GAME_BAR, GAME } from '../GameData'
import Game from '../Scenes/Game'

export default class Border extends Phaser.Physics.Arcade.Group {

  // private defaultSpeed: number;
	// private startPos: Phaser.Math.Vector2;
	private leftScore: number = 0;
	private rightScore: number = 0;
  
	constructor( scene: Game, ball: Phaser.Physics.Arcade.Body) {
  
	  super(scene.physics.world, scene);
	  
	  const leftSide: Phaser.GameObjects.Rectangle = new Phaser.GameObjects.Rectangle(scene, 1, 1, 1, GAME.height * 2, 0x000000);
    this.add(leftSide);
    // leftSide.body?.setImmovable();
	  
    const rightSide: Phaser.GameObjects.Rectangle = new Phaser.GameObjects.Rectangle(scene, GAME.width - 1, 1, 1, GAME.height * 2, 0x000000);
    this.add(rightSide);
    leftSide.body?.setImmovable();
    
    this.children.iterate(() => {
          block.setImmovable(true);  // Rende i blocchi immobili
      });
    // const rightSide: Phaser.Physics.Arcade.Body = this.physics.add.body(GAME.width - 1, 1, 1, GAME.height * 2);
		leftSide.setImmovable();
		this.physics.add.collider(leftSide, this.ball, () => {
			this.leftScore += 1;
			this.resetBallAndBars();
		});
		
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
	}
}