import { GAME } from '../Game.data'
import Game from '../Scenes/Game'

class Field{

	// player info
	private _leftPlayer: {id: string, score: number};
	private _rightPlayer: {id: string, score: number};

	// phaser objects
	private readonly _scene: Game;																// main scene-container
	private readonly _leftBorder: Phaser.Physics.Arcade.Body;			// margin from top-left to bottom left corner
	private readonly _rightBorder: Phaser.Physics.Arcade.Body;		// margin from top-right to bottom right corner
	private readonly _scoreText: Phaser.GameObjects.Text;					// score info object
	
	// @param scene: Phaser.Scene that contains the field
	// @param ball: ball instance of the game 
	// @param idLeft: left-side player id
	// @param idRight: right-side player id
	constructor( scene: Game, ball: Phaser.Physics.Arcade.Body, idLeft: string, idRight: string ) {
		
		this._scene = scene;
		this._leftPlayer = {id: idLeft, score: 0};
		this._rightPlayer = {id: idRight, score: 0};

		// two callbacks (one per side) are linked to the two colliders,
		// they are fired everytime the ball touches the left or right margin
		// that means that either the right or left player scored a point

		this._leftBorder = scene.physics.add.body(1, 1, 1, GAME.height * 2)
		this._leftBorder.setImmovable(true);
		scene.physics.add.collider(this._leftBorder, ball, () => { this.increaseScore(this._rightPlayer.id) });
		
		this._rightBorder = scene.physics.add.body(GAME.width - 1, 1, 1, GAME.height * 2)
		this._rightBorder.setImmovable(true);
		scene.physics.add.collider(this._rightBorder, ball, () => { this.increaseScore(this._leftPlayer.id) });
		
		// shows the score of the game
		this._scoreText = scene.add.text(GAME.width / 2, 50, `${this._leftPlayer.score} : ${this._rightPlayer.score}`, {
			fontSize: '32px',
			align: 'center',
			color: '#0f0',
		}).setOrigin(0.5, 0.5);
	}

	// increase the score of the player, it reaches the
	// maximum stops the game and change scene otherwise
	// resets the position of ball and bars and update
	// the scoreboard
	// @idPlayer: id of the winner of the round
	increaseScore(idPlayer: string): void {

		if ( this._leftPlayer.id == idPlayer ) {

			this._leftPlayer.score += 1;

			if ( this._leftPlayer.score == GAME.maxScore )
				this._scene.endGame(idPlayer);
			else
				this._scene.resetBallAndBars();
		}
		else if ( this._rightPlayer.id == idPlayer ) {

			this._rightPlayer.score += 1;
			
			if ( this._rightPlayer.score == GAME.maxScore )
				this._scene.endGame(idPlayer);
			else
				this._scene.resetBallAndBars();
		}

		this._scoreText.text = `${this._leftPlayer.score} : ${this._rightPlayer.score}`;
	}
}

export default Field;