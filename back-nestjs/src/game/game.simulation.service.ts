import { Injectable } from '@nestjs/common'
import { Socket } from 'socket.io';

import GameStateDTO from '../dto/gameState.dto';
import * as GameTypes from './game.types';
import { GAME, GAME_BALL, GAME_PADDLE } from './game.data';


@Injectable()
export default class SimulationService {
	
	private readonly maxScore: number = GAME.maxScore;
	private readonly windowWidth: number = GAME.width;
	private readonly windowHeight: number = GAME.height;
	private readonly botName: string = GAME.botName;
	private readonly paddleWidth: number = GAME_PADDLE.width;
	private readonly paddleHeight: number = GAME_PADDLE.height;
	private readonly ballSpeed: number = GAME_BALL.speed;
	
	private sessionToken: string = '';		// unique session token shared between the two clients
	private mode: GameTypes.GameMode = GameTypes.GameMode.unset;
	private player1: GameTypes.Player = null;
	private player2: GameTypes.Player = null;
	private ball = { x: GAME.width / 2, y: GAME.height / 2, dx: 5, dy: 5 };
	private waitingToStart = false;
	private engineRunning = false;

	private gameStateInterval: NodeJS.Timeout = null;		// loop for setting up the game
	private gameSetupInterval: NodeJS.Timeout = null;		// engine loop: data emitter to client(s)

	isWaiting(): boolean {

		return (this.waitingToStart);
	};

	isRunning(): boolean {

		return (this.engineRunning);
	};

	startWaiting(): void {

		this.gameSetupInterval = setInterval(() => { // Why is this in an interval? Should it not be called once?
			
			if ((this.player1 === null) || (this.player2 === null) || (this.mode === GameTypes.GameMode.unset))
				return;		// missing info, not ready to play yet
			
			this.waitingToStart = false;
			this.startEngine();
			
			clearInterval(this.gameSetupInterval);
			this.gameSetupInterval = null;
			
		}, GAME.frameRate);

		this.waitingToStart = true;
	};

	startEngine(): void {

		this.gameStateInterval = setInterval(() => {
			
			this.updateBall();
			this.updateBotPaddle();
			this.sendUpdateToPlayers('gameState');
		}, GAME.frameRate);
		
		this.resetBall();
		this.sendUpdateToPlayers('gameStart');

		this.engineRunning = true;
	};

	stopEngine(): void {

		clearInterval(this.gameStateInterval);
		this.gameStateInterval = null;
		this.engineRunning = false;
	};

	sendUpdateToPlayers(msgType: string) {

		// throw excp if engine is not running
		const dataPlayer1: GameStateDTO = {
			ball: {x: this.ball.x, y: this.ball.y},
			p1: {y: this.player1.posY},
			p2: {y: this.player2.posY},
			score: {p1: this.player1.score, p2: this.player2.score},
		}

		this.player1.clientSocket.emit(msgType, dataPlayer1);

		if (this.mode === GameTypes.GameMode.multi) {

			const dataPlayer2: GameStateDTO = {
				ball: {x: this.windowWidth - this.ball.x, y: this.ball.y},
				p1: {y: this.player2.posY},
				p2: {y: this.player1.posY},
				score: {p1: this.player2.score, p2: this.player1.score},
			}
		this.player2.clientSocket.emit(msgType, dataPlayer2);
		}
	};

	setInitData(sessionToken: string, mode: GameTypes.GameMode): void {
	
		if ((this.sessionToken !== '' && this.sessionToken !== sessionToken) ||
				(this.mode !== GameTypes.GameMode.unset && this.mode !== mode)) {
			// throw excp
			console.log("this should never, like NEVER, happen (init info)", this.sessionToken, this.mode);
			return ;
		}
		this.sessionToken = sessionToken;
		this.mode = mode;

		if (this.mode === GameTypes.GameMode.single)		// adding bot if single player
			this.addPlayer(null, -1, this.botName)
	};

	addPlayer(client: Socket, playerId: number, nameNick: string): void {

		const newPlayer: GameTypes.Player = {
			clientSocket: client, // socket created for each client
			intraId: playerId,
			nameNick: nameNick,
			score: 0,
			posY: this.windowHeight / 2,
		}

		// // Check if the player is already in the game (this should happen in Matchmaking..)
		// if ((this.player1 && playerId === this.player1.intraId) || 
		// 	(this.player2 && playerId === this.player2.intraId)) {
		// 	console.log(`The playerId ${newPlayer.intraId} is already in this game.`);
		// 	client.emit('endGame', 'Fail'); // Notify the new connection about the failure
		// 	return; // Exit the function to avoid adding the player again
		// }

		if (nameNick === this.botName)		// set bot, always player2
			this.player2 = newPlayer;
		else if (this.player1 === null)
			this.player1 = newPlayer;
		else if (this.player2 === null)
			this.player2 = newPlayer;
		else		// throw excp
			console.log("this should never, like NEVER, happen (player)");
	};

	// Handle paddle movement based on key data
	movePaddle(idClient: string, direction: GameTypes.PaddleDirection): void {
		
		// throw excp if engine is not running
		const delta = direction === GameTypes.PaddleDirection.up ? -10 : 10;

		if (idClient === this.player1.clientSocket.id)
			this.player1.posY = Math.max(this.paddleHeight / 2, Math.min(this.windowHeight - this.paddleHeight / 2, this.player1.posY + delta));
		else
			this.player2.posY = Math.max(this.paddleHeight / 2, Math.min(this.windowHeight - this.paddleHeight / 2, this.player2.posY + delta));
 	};

  // Get positions of ball and paddles
  getGameState(): GameStateDTO {

		const state: GameStateDTO = {
			ball: {x: this.ball.x, y: this.ball.y},
			p1: {y: this.player1.posY},
			p2: {y: this.player2.posY},
			score: {p1: this.player1.score, p2: this.player2.score},
		}

		return (state);
	};

	// Callback ball
	updateBall(): void {

		// throw excp if engine is not running
		// Move the ball
		this.ball.x += this.ball.dx * this.ballSpeed;
		this.ball.y += this.ball.dy * this.ballSpeed;
	
		// Bounce off top and bottom walls
		if (this.ball.y <= 0 || this.ball.y >= this.windowHeight) {
			this.ball.dy = -this.ball.dy;
		}

		// Collision detection with paddles
		const leftPaddleOffset = this.paddleHit(this.player1.posY, true);
		const rightPaddleOffset = this.paddleHit(this.player2.posY, false);
		const maxAngle = Math.PI / 4;  // Maximum bounce angle from paddle center (45 degrees)

		if (leftPaddleOffset !== null) {
			// Calculate new `dy` based on the offset from the center of the paddle
			const normalizedOffset = leftPaddleOffset / (this.paddleHeight / 2); // -1 to 1 range
			const angle = normalizedOffset * maxAngle;
			this.ball.dx = Math.abs(this.ball.dx); // Move right
			this.ball.dy = Math.tan(angle) * Math.abs(this.ball.dx); // Set dy based on angle
		} else if (rightPaddleOffset !== null) {
			const normalizedOffset = rightPaddleOffset / (this.paddleHeight / 2); // -1 to 1 range
			const angle = normalizedOffset * maxAngle;
			this.ball.dx = -Math.abs(this.ball.dx); // Move left
			this.ball.dy = Math.tan(angle) * Math.abs(this.ball.dx); // Set dy based on angle
		}

		// Check for scoring
		if (this.ball.x <= 0) {	// point for player2
			this.player2.score += 1;
			if (this.player2.score === this.maxScore)
				this.endGame(this.player2);
			else
				this.resetBall();  // Reset position and give random velocity
		}
		else if (this.ball.x >= this.windowWidth) {	// point for player1
			this.player1.score += 1;
			if (this.player1.score === this.maxScore)
				this.endGame(this.player1);
			else
				this.resetBall();  // Reset position and give random velocity
		}
	};

	// Callback opponent paddle
	updateBotPaddle(): void {

		// throw excp if engine is not running
		if (this.mode === GameTypes.GameMode.single && this.ball.x > this.windowWidth / 2) {

			if (this.ball.y < this.player2.posY - 30)
				this.movePaddle(this.botName, GameTypes.PaddleDirection.up);
			else if (this.ball.y > this.player2.posY + 30)
				this.movePaddle(this.botName, GameTypes.PaddleDirection.down);
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

		// throw excp if engine is not running
		this.ball.x = this.windowWidth / 2;  // Reset to center of the screen
		this.ball.y = this.windowHeight / 2;
		const randomDelta = this.randomDelta();
		this.ball.dx = randomDelta.dx;
		this.ball.dy = randomDelta.dy
	};

	paddleHit(player_y: number, isLeftPaddle: boolean): number | null {

		// throw excp if engine is not running
		const collisionZone = Math.abs(player_y - this.ball.y);
		if (isLeftPaddle) {
			if (this.ball.x <= this.paddleWidth && collisionZone <= this.paddleHeight / 2)
				return player_y - this.ball.y;  // Return offset
		}
		else {
			if (this.ball.x >= this.windowWidth - this.paddleWidth && collisionZone <= this.paddleHeight / 2)
				return player_y - this.ball.y;  // Return offset
		}
		return null;  // No collision
	};

	handleDisconnect(client: Socket): void {
		if (this.isRunning() === false)
			return;
		
		this.stopEngine();
		
		if (this.mode === GameTypes.GameMode.multi) { // force to disconnect the other client, only in multi-player mode
			
			if (this.player1.clientSocket.id === client.id) {
				this.player2.clientSocket.emit('PlayerDisconnected', `Game interrupted\nPlayer ${this.player1.nameNick} left the game`);
				this.player2.clientSocket.disconnect(true);
			}
			else if (this.player2.clientSocket.id === client.id) {
				this.player1.clientSocket.emit('PlayerDisconnected', `Game interrupted\nPlayer ${this.player2.nameNick} left the game`);
				this.player1.clientSocket.disconnect(true);
			}
		}
		
		// do not clear data immediately because there can be loops of the engine
		// scheduled before it stops but that happens after
		setTimeout(() => this.clearGameData(), GAME.frameRate);
	};

	endGame(winner: GameTypes.Player): void {
		
		this.stopEngine();
		
		if (this.player1 !== null) { // This can happen sometimes when the intra name/id is the same
			this.player1.clientSocket.emit('endGame', winner.nameNick) 
			this.player1.clientSocket.disconnect(true);
		}
		if (this.mode === GameTypes.GameMode.multi) {

			this.player2.clientSocket.emit('endGame', winner.nameNick)
			this.player2.clientSocket.disconnect(true).emit('endGame', winner.nameNick);
		}

		// do not clear data immediately because there can be loops of the engine
		// scheduled before it stops but that happens after
		setTimeout(() => this.clearGameData(), GAME.frameRate);
	};


	clearGameData(): void {

		this.sessionToken = '';
		this.mode = GameTypes.GameMode.unset;
		this.player1 = null;
		this.player2 = null;
		this.ball = { x: GAME.width / 2, y: GAME.height / 2, dx: 5, dy: 5 };
	};

	checkClientId(clientId: string): boolean {
		return (clientId == this.player1.clientSocket.id || clientId == this.player2.clientSocket.id);
	}
};

