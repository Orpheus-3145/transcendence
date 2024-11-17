import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Injectable } from '@nestjs/common'
import { Server, Socket } from 'socket.io';

// A provider can be injected as a dependency, object can create various relationships with each other.
// Dependencies are passed to the constructor of your controller
@Injectable()
export default class SimulationService {

	windowWidth = 0; // will be overwritten by the value from the client
	windowHeight = 0; // overwritten by value form the client
	paddleWidth = 0;
	paddleHeight = 0;
	private speed = 1.5
	private ball = { x: this.windowWidth / 2, y: this.windowHeight / 2, dx: 5, dy: 5 };
  	private player1 = { y: this.windowHeight / 2 };
  	private player2 = { y: this.windowHeight / 2 };
	private score: { player1: number; player2: number } = { player1: 0, player2: 0 };
	// private score = {player1: 0, player2: 0}
	private botEnabled: boolean = false;
	private roomId: number;
	private gameStateInterval;
	private updateBallInterval;
	private botPaddleInterval;
	private server

	setupGame(server: Server) {
		this.server = server
		// Set up a loop to broadcast game state
		this.gameStateInterval = setInterval(() => {
			const gameState = this.getGameState();
			this.server.emit('gameState', gameState);
		}, 1000 / 30); // Emit at 30 FPS
	
		this.updateBallInterval = setInterval(() => {
			this.updateBall();
		}, 1000/30); // For 30 FPS, like the other interval
		
		this.botPaddleInterval = setInterval(() =>{
			this.updateBotPaddle();
		}, 1000/30);
	}

// Set everything to the start position: ball in the centre, paddles centralised
	setStartPos() {
		const randomDelta = this.randomDelta();
		this.ball = { x: this.windowWidth / 2, y: this.windowHeight/2, dx: randomDelta.dx, dy: randomDelta.dy};
		this.player1.y = this.windowHeight / 2;
		this.player2.y = this.windowHeight / 2;
		this.score.player1 = 0;
		this.score.player2 = 0;
	};

	randomDelta(): { dx: number, dy: number} {
		const randomX = Math.random() * (Math.sqrt(3) / 2 - 1) + 1; // between [rad(3)/2, 1] = [cos(+-30), cos(0)]
		const randomY = Math.random() * (0.5 + 0.5) - 0.5; // between [-1/2, 1/2] = [sin(-30), sin(30)]
		const randomDirection = Math.random() < 0.5 ? -1 : 1;							// random between -1 and 1
		const speed = 10;  // You can adjust this value for ball speed

		const deltaX = randomX * randomDirection * speed;
		const deltaY = randomY * speed;
		return {dx: deltaX, dy: deltaY};
	}

	resetBall() {
		this.ball.x = this.windowWidth / 2;  // Reset to center of the screen
		this.ball.y = this.windowHeight / 2;
		const randomDelta = this.randomDelta();
		this.ball.dx = randomDelta.dx;
		this.ball.dy = randomDelta.dy
	}


// paddleHit(player_y: number, isLeftPaddle: boolean): boolean {
//	 if (isLeftPaddle) {
//		 return (
//			 this.ball.x <= this.paddleWidth &&
//			 Math.abs(player_y - this.ball.y) <= this.paddleHeight / 2
//		 );
//	 } else {
//		 return (
//			 this.ball.x >= this.windowWidth - this.paddleWidth &&
//			 Math.abs(player_y - this.ball.y) <= this.paddleHeight / 2
//		 );
//	 }
// }
	paddleHit(player_y: number, isLeftPaddle: boolean): number | null {
		const collisionZone = Math.abs(player_y - this.ball.y);
		if (isLeftPaddle) {
			if (this.ball.x <= this.paddleWidth && collisionZone <= this.paddleHeight / 2) {
				return player_y - this.ball.y;  // Return offset
			}
		} else {
			if (this.ball.x >= this.windowWidth - this.paddleWidth && collisionZone <= this.paddleHeight / 2) {
				return player_y - this.ball.y;  // Return offset
			}
		}
		return null;  // No collision
	}


// updateBall() {
//	 // Move the ball
//	 this.ball.x += this.ball.dx * this.speed;
//	 this.ball.y += this.ball.dy * this.speed;

//	 // Bounce off top and bottom walls
//	 if (this.ball.y <= 0 || this.ball.y >= this.windowHeight) {
//		 this.ball.dy = -this.ball.dy;
//	 }

//	 // Collision detection with left paddle
//	 if (this.paddleHit(this.player1.y, true)) {
//		 this.ball.dx = Math.abs(this.ball.dx);  // Ensure ball moves right after left paddle hit
//	 }

//	 // Collision detection with right paddle
//	 if (this.paddleHit(this.player2.y, false)) {
//		 this.ball.dx = -Math.abs(this.ball.dx);  // Ensure ball moves left after right paddle hit
//	 }

//	 // If hits left wall, player2 get a point
//	 if (this.ball.x <= 0) {
// 		++this.score.player2;
// 		this.resetBall();  // Reset position and give random velocity
// 	}
//  	else if (this.ball.x >= this.windowWidth) { // If hits right wall, player1 get a point
// 		++this.score.player1;
//		 this.resetBall();  // Reset position and give random velocity
//	 }
// 	// console.log(`Score updated: Left - ${this.score.player1}, Right - ${this.score.player2}`); // 

// }

	checkScore(): boolean {
		return (this.score.player1 == 3 || this.score.player2 == 3);
	}

	updateBall() {
		// Move the ball
		this.ball.x += this.ball.dx * this.speed;
		this.ball.y += this.ball.dy * this.speed;

		// Bounce off top and bottom walls
		if (this.ball.y <= 0 || this.ball.y >= this.windowHeight) {
			this.ball.dy = -this.ball.dy;
		}

		// Collision detection with paddles
		const leftPaddleOffset = this.paddleHit(this.player1.y, true);
		const rightPaddleOffset = this.paddleHit(this.player2.y, false);
		const maxAngle = Math.PI / 4;  // Maximum bounce angle from paddle center (45 degrees)

		if (leftPaddleOffset !== null) {
			// Calculate new `dy` based on the offset from the center of the paddle
			const normalizedOffset = leftPaddleOffset / (this.paddleHeight / 2);  // -1 to 1 range
			const angle = normalizedOffset * maxAngle;
			this.ball.dx = Math.abs(this.ball.dx);  // Move right
			this.ball.dy = Math.tan(angle) * Math.abs(this.ball.dx);  // Set dy based on angle
		} else if (rightPaddleOffset !== null) {
			const normalizedOffset = rightPaddleOffset / (this.paddleHeight / 2);  // -1 to 1 range
			const angle = normalizedOffset * maxAngle;
			this.ball.dx = -Math.abs(this.ball.dx);  // Move left
			this.ball.dy = Math.tan(angle) * Math.abs(this.ball.dx);  // Set dy based on angle
		}

		// Check for scoring
		if (this.ball.x <= 0) {
			++this.score.player2;
			this.resetBall();  // Reset position and give random velocity
		} else if (this.ball.x >= this.windowWidth) {
			++this.score.player1;
			this.resetBall();  // Reset position and give random velocity
		}
		if (this.checkScore()){
			// Stop simulation
			clearInterval(this.gameStateInterval);
			clearInterval(this.botPaddleInterval);
			clearInterval(this.updateBallInterval);
			const gameState = this.getGameState();
			this.server.emit('gameState', gameState);
		}
	}




	updateBotPaddle() {
	// Move bot if enabled
	if (this.botEnabled && this.ball.x > this.windowWidth / 2) {

		if (this.ball.y < this.player2.y - 30) {
			this.movePaddle('player2', 'up');
		} else if (this.ball.y > this.player2.y + 30) {
			this.movePaddle('player2', 'down');
		}
	}
}

	movePaddle(player: 'player1' | 'player2', direction: 'up' | 'down') {
	const paddle = player === 'player1' ? this.player1 : this.player2;
	const delta = direction === 'up' ? -10 : 10;
	paddle.y = Math.max(this.paddleHeight / 2, Math.min(this.windowHeight - this.paddleHeight / 2, paddle.y + delta));

}

	// Handle paddle movement based on key data
  handlePaddle(player: 'player1' | 'player2', direction: 'up' | 'down') {
	this.movePaddle(player, direction);
	}


  // Get positions of ball and paddles
  getGameState() {
	return {
	  ball: {x: this.ball.x, y: this.ball.y},
	  player1: this.player1,
	  player2: this.player2,
		score: this.score
		};
	}

	setGameData(windowWidth: number, windowHeight: number, paddleWidth: number, paddleHeight: number, bot: boolean) {
		this.windowWidth = windowWidth;
		this.windowHeight = windowHeight;
		this.paddleWidth = paddleWidth;
		this.paddleHeight = paddleHeight;
		this.botEnabled = bot;
	}
}

