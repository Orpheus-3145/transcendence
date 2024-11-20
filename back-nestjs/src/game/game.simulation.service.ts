import { Injectable } from '@nestjs/common'
import { Socket } from 'socket.io';

import GameStateDTO from '../dto/game.state.dto';
import Player, { GameMode } from './player.interface';
import { GAME, GAME_BALL, GAME_PADDLE } from './game.data';


// A provider can be injected as a dependency, object can create various relationships with each other.
// Dependencies are passed to the constructor of your controller
@Injectable()
export default class SimulationService {
	
	private readonly maxScore: number = GAME.maxScore;
	private readonly windowWidth: number = GAME.width; // overwritten by the value from the client: why? Shouldn't the value be same and given to clients?
	private readonly windowHeight: number = GAME.height; // overwritten by the value from the client: why? Shouldn't the value be same and given to clients?
	private readonly botName: string = GAME.botName;
	private readonly paddleWidth: number = GAME_PADDLE.width;
	private readonly paddleHeight: number = GAME_PADDLE.height;
	private readonly ballSpeed: number = GAME_BALL.speed;
	
	private sessionToken: string = '';		// unique session token shared between the two clients
	private mode: GameMode = GameMode.unset;
	private players: Array<Player> = [];
	private ball = { x: GAME.width / 2, y: GAME.height / 2, dx: 5, dy: 5 };
	private sessionRunning = false;
	
	private gameStateInterval: NodeJS.Timeout = null;		// loop for setting up the game
	private updateBallInterval: NodeJS.Timeout = null;		// engine loop: moving the ball
	private botPaddleInterval: NodeJS.Timeout = null;    // engine loop: moving mov
	private gameSetupInterval: NodeJS.Timeout = null;		// engine loop: data emitter to client(s)

	isRunning(): boolean {

		return (this.sessionRunning);
	};

	startSession(): void {

		this.gameSetupInterval = setInterval(() => {
			
			if ((this.players.length < 1) || 
				(this.players.length == 1 && this.mode === GameMode.multi))
				return;		// not ready to play yet

			if (this.mode === GameMode.single)		// adding bot if single player
				this.addPlayer(null, -1, this.botName)

			this.startEngine();
			this.sendUpdateToPlayers('gameStart');

			clearInterval(this.gameSetupInterval);
			this.gameSetupInterval = null;
		}, GAME.frameRate);
		
		this.resetBall();
		this.sessionRunning = true;
	}

	startEngine(): void {

		if (this.players.length != 2 || this.mode == GameMode.unset) {

			console.log("starting conditions not set");
			return ;
		}

		this.gameStateInterval = setInterval(() => {

			this.sendUpdateToPlayers('gameState');
		}, GAME.frameRate);
	
		this.updateBallInterval = setInterval(() => {
			
			this.updateBall();
		}, GAME.frameRate);
		
		this.botPaddleInterval = setInterval(() =>{
			
			this.updateBotPaddle();
		}, GAME.frameRate);
	};

	stopEngine(): void {

		this.sessionToken = '';
		this.mode = GameMode.unset;
		this.players = [];
		this.ball = { x: 0, y: 0, dx: 5, dy: 5 };
		this.sessionRunning = false;

		clearInterval(this.gameStateInterval);
		clearInterval(this.botPaddleInterval);
		clearInterval(this.updateBallInterval);
		
		this.gameStateInterval = null;
		this.botPaddleInterval = null;
		this.updateBallInterval = null;
	};

	sendUpdateToPlayers(msgType: string) {

		this.players[0].clientSocket.emit(msgType, this.getGameState());

		if (this.mode == GameMode.multi)
			this.players[1].clientSocket.emit(msgType, this.getGameState());
	};

	addPlayer(client: Socket, playerId: number, nameNick: string): void {

		if (this.players.length == 2) {

			console.log("this should never, like NEVER, happen (player)");
			return ;
		}

		const newPlayer: Player = {
			clientSocket: client,
			intraId: playerId,
			nameNick: nameNick,
			score: 0,
			posY: this.windowHeight / 2,
		}
		
		this.players.push(newPlayer);
	};

	setInitData(sessionToken: string, mode: GameMode): void {
	
		if ((this.sessionToken !== '' && this.sessionToken !== sessionToken) ||
				(this.mode !== GameMode.unset && this.mode !== mode)) {
			
			console.log("this should never, like NEVER, happen (init info)", this.sessionToken, this.mode);
			return ;
		}
		this.sessionToken = sessionToken;
		this.mode = mode;
	};
	
	// Handle paddle movement based on key data
	movePaddle(playerNick: string, direction: 'up' | 'down'): void {
		
		const delta = direction === 'up' ? -10 : 10;

		if (playerNick == this.players[0].nameNick)
			this.players[0].posY = Math.max(this.paddleHeight / 2, Math.min(this.windowHeight - this.paddleHeight / 2, this.players[0].posY + delta));
		else
			this.players[1].posY = Math.max(this.paddleHeight / 2, Math.min(this.windowHeight - this.paddleHeight / 2, this.players[1].posY + delta));
 	};

  // Get positions of ball and paddles
  getGameState(): GameStateDTO {

		const state: GameStateDTO = {
			ball: {x: this.ball.x, y: this.ball.y},
			player1: {y: this.players[0].posY},
			player2: {y: this.players[1].posY},
			score: {p1: this.players[0].score, p2: this.players[1].score},
		}

		return (state);
	};
	
	// Callback ball
	updateBall(): void {
		// Move the ball
		this.ball.x += this.ball.dx * this.ballSpeed;
		this.ball.y += this.ball.dy * this.ballSpeed;
	
		// Bounce off top and bottom walls
		if (this.ball.y <= 0 || this.ball.y >= this.windowHeight) {
			this.ball.dy = -this.ball.dy;
		}

		// Collision detection with paddles
		const leftPaddleOffset = this.paddleHit(this.players[0].posY, true);
		const rightPaddleOffset = this.paddleHit(this.players[1].posY, false);
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
		if (this.ball.x <= 0) {	// point for player2
			this.players[1].score += 1;
			if (this.players[1].score == this.maxScore)
				this.endGame(this.players[1]);
			else
				this.resetBall();  // Reset position and give random velocity
		} else if (this.ball.x >= this.windowWidth) {	// point for player1
			this.players[0].score += 1;
			if (this.players[0].score == this.maxScore)
				this.endGame(this.players[0]);
			else
				this.resetBall();  // Reset position and give random velocity
		}
	};

	// Callback opponent paddle
	updateBotPaddle(): void {
		if (this.mode === GameMode.single && this.ball.x > this.windowWidth / 2) {

			if (this.ball.y < this.players[1].posY - 30) {
				this.movePaddle(this.botName, 'up');
			} else if (this.ball.y > this.players[1].posY + 30) {
				this.movePaddle(this.botName, 'down');
			}
		}
 	};

	randomDelta(): { dx: number, dy: number} {
		const randomX = Math.random() * (Math.sqrt(3) / 2 - 1) + 1; // between [rad(3)/2, 1] = [cos(+-30), cos(0)]
		const randomY = Math.random() * (0.5 + 0.5) - 0.5; // between [-1/2, 1/2] = [sin(-30), sin(30)]
		const randomDirection = Math.random() < 0.5 ? -1 : 1;							// random between -1 and 1
		const speed = 10;  // You can adjust this value for ball speed

		const deltaX = randomX * randomDirection * speed;
		const deltaY = randomY * speed;
		return {dx: deltaX, dy: deltaY};
	};

	resetBall(): void {

		this.ball.x = this.windowWidth / 2;  // Reset to center of the screen
		this.ball.y = this.windowHeight / 2;
		const randomDelta = this.randomDelta();
		this.ball.dx = randomDelta.dx;
		this.ball.dy = randomDelta.dy
	};

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
	};

	endGame(winner: Player): void {

		this.players[0].clientSocket.emit('endGame', winner.nameNick);
		if (this.mode == GameMode.multi)
			this.players[1].clientSocket.emit('endGame', winner.nameNick);
		
		this.stopEngine();
	};
}

