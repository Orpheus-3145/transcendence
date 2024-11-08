import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Injectable } from '@nestjs/common'

// A provider can be injected as a dependency, object can create various relationships with each other.
// Dependencies are passed to the constructor of your controller
@Injectable()
export class SimulationService {
	/* Logic
	   - Check what key is being pressed/ direction by the players
	   - Based on that move the position of the paddle
	   - Calculate the direction of the ball depending on where it hits the paddle
	   - Move ball based on a speed
	   - If ball collides with paddle change direction
	   - otherwise there has been a ponumbers change
	*/
	// private ball: number, // vector
	// private player1: number, // y coordinate only (probably the centre coordinate)
	// private player2: number, // y coordinate only
	// private bot: boolean, // bot will automatically move towards the position of the ball
	// private roomId: number, // different game rooms can existprivate
	windowWidth = 1152; // will be overwritten by the value from the client
	windowHeight = 648; // overwritten by value form the clien t
	private ball = { x: 400, y: 300, dx: 5, dy: 5 };
  	private player1 = { y: 300 };
  	private player2 = { y: 300 };
  	private botEnabled = false;
  	private roomId: number;

// Set everything to the start position: ball in the centre, paddles centralised
  setStartPos() {
    this.ball = { x: this.windowWidth / 2, y: this.windowHeight/2, dx: 5, dy: 5 };
    this.player1.y = this.windowHeight / 2;
    this.player2.y = this.windowHeight / 2; 
  };


resetBall() {
    this.ball.x = this.windowWidth / 2;  // Reset to center of the screen
    this.ball.y = this.windowHeight / 2;
	const randomXDirection = Math.random() < 0.5 ? -1 : 1;  // Random horizontal direction
    const randomYDirection = Math.random() < 0.5 ? -1 : 1;  // Random vertical direction
    const speed = 0.2;  // You can adjust this value for ball speed

    this.ball.dx = randomXDirection * speed;
    this.ball.dy = randomYDirection * speed;
}


updateBall() {
    // Move the ball
    this.ball.x += this.ball.dx;
    this.ball.y += this.ball.dy;

    // Bounce off top and bottom walls
    if (this.ball.y <= 0 || this.ball.y >= this.windowHeight) {
        this.ball.dy = -this.ball.dy;
    }

    // // Collision detection with paddles (Player bars)
    // // Left Paddle (Player 1)
    // if (
    //     this.ball.x <= 50 && 
    //     Math.abs(this.player1.y - this.ball.y) <= 50
    // ) {
    //     this.ball.dx = -this.ball.dx;  // Reverse direction when ball hits left paddle
    // }
    //
    // // Right Paddle (Player 2)
    // if (
    //     this.ball.x >= 750 && 
    //     Math.abs(this.player2.y - this.ball.y) <= 50
    // ) {
    //     this.ball.dx = -this.ball.dx;  // Reverse direction when ball hits right paddle
    // }

	if (this.ball.x <= 0 || this.ball.x >= this.windowWidth) {
    this.resetBall();  // Reposition the ball and give it a random velocity
	}
};

    // Handle paddle movement based on key data
  movePaddle(player: 'player1' | 'player2', direction: 'up' | 'down') {
    const paddle = player === 'player1' ? this.player1 : this.player2;
    const delta = direction === 'up' ? -10 : 10;
    paddle.y = Math.max(0, Math.min(this.windowHeight, paddle.y + delta));
	console.log(`Player move->  playerId: ${player} | direction: ${direction} | y_pos: ${paddle.y}`);


  }

  // Get positions of ball and paddles
  getGameState() {
    return {
      ball: this.ball,
      player1: this.player1,
      player2: this.player2,
    	};
	}
	getGameWindow() {
		return {
			width: this.windowWidth,
			height: this.windowHeight
		};
	}

}

