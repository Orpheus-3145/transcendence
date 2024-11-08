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
	windowWidth = 0; // will be overwritten by the value from the client
	windowHeight = 0; // overwritten by value form the client
	paddleWidth = 0;
	paddleHeight = 0;
	private ball = { x: this.windowWidth / 2, y: this.windowHeight / 2, dx: 5, dy: 5 };
  	private player1 = { y: this.windowHeight / 2 };
  	private player2 = { y: this.windowHeight / 2 };
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

	// Formula: Math.random() * (max - min) + min
	const randomX = Math.random() * (Math.sqrt(3) / 2 - 1) + 1; // between [rad(3)/2, 1] = [cos(+-30), cos(0)]
	const randomY = Math.random() * (0.5 + 0.5) - 0.5; // between [-1/2, 1/2] = [sin(-30), sin(30)]
	const randomDirection = Math.random() < 0.5 ? -1 : 1;							// random between -1 and 1
    const speed = 0.5;  // You can adjust this value for ball speed

    this.ball.dx = randomX * randomDirection * speed;
    this.ball.dy = randomY * speed;
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
    //     this.ball.x <= this.paddleWidth && 
    //     Math.abs(this.player1.y - this.ball.y) <= this.paddleWidth
    // ) {
    //     this.ball.dx = -this.ball.dx;  // Reverse direction when ball hits left paddle
    // }

    // Right Paddle (Player 2)
    if (
        this.ball.x >= (this.windowWidth - this.paddleWidth) && 
		(this.ball.y <= this.player1.y - this.paddleHeight/2 && this.ball.y >= this.player1.y + this.paddleHeight/2)
       // Math.abs(this.player2.y - this.ball.y) <= (this.windowWidth - this.paddleWidth)
    ) {
        this.ball.dx = -this.ball.dx;  // Reverse direction when ball hits right paddle
    }

	if (this.ball.x <= 0 || this.ball.x >= this.windowWidth) {
    this.resetBall();  // Reposition the ball and give it a random velocity
	}
};

    // Handle paddle movement based on key data
  movePaddle(player: 'player1' | 'player2', direction: 'up' | 'down') {
    const paddle = player === 'player1' ? this.player1 : this.player2;
    const delta = direction === 'up' ? -10 : 10;
    paddle.y = Math.max(this.paddleHeight / 2, Math.min(this.windowHeight - this.paddleHeight / 2, paddle.y + delta));
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
	setObjectSize(windowWidth: number, windowHeight: number, paddleWidth: number, paddleHeight: number) {
		this.windowWidth = windowWidth;
		this.windowHeight = windowHeight;
		this.paddleWidth = paddleWidth;
		this.paddleHeight = paddleHeight;
	}

}

