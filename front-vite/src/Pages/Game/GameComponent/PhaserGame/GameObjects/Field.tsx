import { GAME } from '../Game.data';
import Game from '../Scenes/Game';

class Field {
  // Player info
  private _leftScore: number = 0;
  private _rightScore: number = 0;

  // Phaser objects
  private readonly _scene: Game; // Main scene-container
  private readonly _scoreText: Phaser.GameObjects.Text; // Score display text object

  // Constructor initializes the scene and sets up score display
  constructor(scene: Game) {
    this._scene = scene;

    // Initialize the score display at the top center of the game screen
    this._scoreText = scene.add.text(
      GAME.width / 2,
      50,
      `${this._leftScore} : ${this._rightScore}`, 
      {
        fontSize: '32px',
        align: 'center',
        color: '#0f0',
      }
    ).setOrigin(0.5, 0.5);
  }

  // Sets the score and updates the display immediately
  setScore(left: number, right: number): void {
    this._leftScore = left;
    this._rightScore = right;
    this.updateScore(); // Update the score text whenever the score changes
  }

  // Updates the score text on the screen
  updateScore(): void {
    this._scoreText.text = `${this._leftScore} : ${this._rightScore}`;
  }
}

export default Field;
