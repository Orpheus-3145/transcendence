import { Injectable, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'socket.io';

import GameStateDTO from 'src/dto/gameState.dto';
import * as GameTypes from 'src/game/game.types';
import AppLoggerService from 'src/log/log.service';
import ExceptionFactory from 'src/errors/exceptionFactory.service';

@Injectable({ scope: Scope.TRANSIENT })
export default class SimulationService {
	private readonly maxScore: number = parseInt(this.config.get('GAME_MAX_SCORE'), 10);
	private readonly windowWidth: number = parseInt(this.config.get('GAME_WIDTH'), 10);
	private readonly windowHeight: number = parseInt(this.config.get('GAME_HEIGHT'), 10);
	private readonly botName: string = this.config.get<string>('GAME_BOT_NAME');
	private readonly paddleWidth: number = parseInt(this.config.get('GAME_PADDLE_WIDTH'), 10);
	private readonly paddleHeight: number = parseInt(this.config.get('GAME_PADDLE_HEIGHT'), 10);
	private readonly paddleSpeed: number = parseInt(this.config.get('GAME_PADDLE_SPEED'), 10);
	private readonly ballSpeed: number = parseInt(this.config.get('GAME_BALL_SPEED'), 10);
	private readonly frameRate: number = parseInt(this.config.get('GAME_FPS'), 10);

	private sessionToken: string;
	private mode: GameTypes.GameMode = GameTypes.GameMode.unset;
	private forbidAutoPlay: boolean = this.config.get<boolean>('FORBID_AUTO_PLAY', false); // if true the same user cannot play against themself

	private engineRunning: boolean = false;
	private gameOver: boolean = false;
	private player1: GameTypes.Player = null;
	private player2: GameTypes.Player = null;
	private ball = { x: this.windowWidth / 2, y: this.windowHeight / 2, dx: 5, dy: 5 };

	private gameStateInterval: NodeJS.Timeout = null; // loop for setting up the game
	private gameSetupInterval: NodeJS.Timeout = null; // engine loop: data emitter to client(s)

	constructor(
		private readonly logger: AppLoggerService,
		private readonly thrower: ExceptionFactory,
		private readonly config: ConfigService,
	) {
		this.logger.setContext(SimulationService.name);
		// do not log all the emits to clients if not really necessary
		if (this.config.get<boolean>('DEBUG_MODE_GAME', false) == false)
			this.logger.setLogLevels(['log', 'warn', 'error', 'fatal']);
	}

	setInitInfo(sessionToken: string, mode: GameTypes.GameMode) {
		this.sessionToken = sessionToken;
		this.mode = mode;

		// add bot if single mode
		if (this.mode === GameTypes.GameMode.single) this.addPlayer(null, -1, this.botName);

		this.gameSetupInterval = setInterval(() => {
			// missing info, not ready to play yet
			if (!this.player1 || !this.player2) return;

			if (this.forbidAutoPlay == true && this.player1.nameNick == this.player2.nameNick)
				this.interruptGame(`cannot play against yourself: ${this.player1.nameNick}`);
			else this.startEngine();
		}, this.frameRate);
	}

	startEngine(): void {
		if (this.engineRunning) return;

		this.engineRunning = true;

		clearInterval(this.gameSetupInterval);
		this.gameSetupInterval = null;

		this.gameStateInterval = setInterval(() => this.gameIteration(), this.frameRate);
		this.logger.debug(`session [${this.sessionToken}] - player1: ${this.player1.nameNick}`);
		this.logger.debug(`session [${this.sessionToken}] - player2: ${this.player2.nameNick}`);
		this.logger.log(`session [${this.sessionToken}] - game started`);

		this._resetBall();
		this._sendUpdateToPlayers('gameStart');
	}

	stopEngine(): void {
		if (this.engineRunning === false) return;

		clearInterval(this.gameStateInterval);
		this.gameStateInterval = null;

		this.engineRunning = false;

		if (this.player1 !== null) {
			this.player1.clientSocket.disconnect(true);
			this.player1 = null;
		}
		if (this.mode === GameTypes.GameMode.multi && this.player2 !== null) {
			this.player2.clientSocket.disconnect(true);
			this.player2 = null;
		}

		this.mode = GameTypes.GameMode.unset;
		this.logger.debug(`session [${this.sessionToken}] - engine stopped`);
	}

	gameIteration(): void {
		try {
			this._updateBall();

			if (this.mode === GameTypes.GameMode.single) this._updateBotPaddle();

			if (this.gameOver) {
				if (this.player2.score === this.maxScore) this.endGame(this.player2);
				else this.endGame(this.player1);
			} else this._sendUpdateToPlayers('gameState');
		} catch (error) {
			this.interruptGame(error.message);
		}
	}

	addPlayer(client: Socket, playerId: number, nameNick: string): void {
		if (this.engineRunning)
			this.thrower.throwGameExcp(
				`tried to add player ${playerId}, but game has started already`,
				this.sessionToken,
				`${SimulationService.name}.${this.constructor.prototype.addPlayer.name}()`,
			);

		const newPlayer: GameTypes.Player = {
			clientSocket: client, // socket created for each client
			intraId: playerId,
			nameNick: nameNick,
			score: 0,
			posY: this.windowHeight / 2,
		};

		if (nameNick === this.botName)
			// set bot, always player2
			this.player2 = newPlayer;
		else if (this.player1 === null) this.player1 = newPlayer;
		else if (this.player2 === null) this.player2 = newPlayer;
		else {
			const context = `${SimulationService.name}.${this.constructor.prototype.addPlayer.name}`;
			if (playerId === this.player1.intraId || playerId === this.player2.intraId)
				// already inside game
				this.thrower.throwGameExcp(
					`player ${playerId} is already in this game`,
					this.sessionToken,
					context,
				);
			// unknown player
			else
				this.thrower.throwGameExcp(
					`room full, failed to add player ${playerId}`,
					this.sessionToken,
					context,
				);
		}
	}

	// Handle paddle movement based on key data
	movePaddle(idClient: string, direction: GameTypes.PaddleDirection): void {
		if (this.engineRunning === false) return;

		const delta =
			direction === GameTypes.PaddleDirection.up ? this.paddleSpeed * -1 : this.paddleSpeed;

		if (idClient === this.player1.clientSocket.id)
			this.player1.posY = Math.max(
				this.paddleHeight / 2,
				Math.min(this.windowHeight - this.paddleHeight / 2, this.player1.posY + delta),
			);
		else
			this.player2.posY = Math.max(
				this.paddleHeight / 2,
				Math.min(this.windowHeight - this.paddleHeight / 2, this.player2.posY + delta),
			);
	}

	// Get positions of ball and paddles
	getGameState(): GameStateDTO {
		const state: GameStateDTO = {
			ball: { x: this.ball.x, y: this.ball.y },
			p1: { y: this.player1.posY },
			p2: { y: this.player2.posY },
			score: { p1: this.player1.score, p2: this.player2.score },
		};

		return state;
	}

	_sendUpdateToPlayers(msgType: string) {
		if (this.engineRunning === false)
			this.thrower.throwGameExcp(
				`simulation is not running`,
				this.sessionToken,
				`${SimulationService.name}._sendUpdateToPlayers()`,
			);

		const dataPlayer1: GameStateDTO = {
			ball: { x: this.ball.x, y: this.ball.y },
			p1: { y: this.player1.posY },
			p2: { y: this.player2.posY },
			score: { p1: this.player1.score, p2: this.player2.score },
		};

		this._sendMsgToPlayer(this.player1.clientSocket, msgType, dataPlayer1);

		if (this.mode === GameTypes.GameMode.multi) {
			const dataPlayer2: GameStateDTO = {
				ball: { x: this.windowWidth - this.ball.x, y: this.ball.y },
				p1: { y: this.player2.posY },
				p2: { y: this.player1.posY },
				score: { p1: this.player2.score, p2: this.player1.score },
			};

			this._sendMsgToPlayer(this.player2.clientSocket, msgType, dataPlayer2);
		}
	}

	// Callback ball
	_updateBall(): void {
		if (this.engineRunning === false)
			this.thrower.throwGameExcp(
				`simulation is not running`,
				this.sessionToken,
				`${SimulationService.name}._updateBall()`,
			);

		// Move the ball
		this.ball.x += this.ball.dx * this.ballSpeed;
		this.ball.y += this.ball.dy * this.ballSpeed;

		// Bounce off top and bottom walls
		if (this.ball.y <= 0 || this.ball.y >= this.windowHeight) {
			this.ball.dy = -this.ball.dy;
		}

		// Collision detection with paddles
		const leftPaddleOffset = this._paddleHit(this.player1.posY, true);
		const rightPaddleOffset = this._paddleHit(this.player2.posY, false);
		const maxAngle = Math.PI / 4; // Maximum bounce angle from paddle center (45 degrees)

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
		if (this.ball.x <= 0) {
			// point for player2
			this.player2.score += 1;
			if (this.player2.score === this.maxScore) this.gameOver = true;
			else this._resetBall(); // Reset position and give random velocity
		} else if (this.ball.x >= this.windowWidth) {
			// point for player1
			this.player1.score += 1;
			if (this.player1.score === this.maxScore) this.gameOver = true;
			else this._resetBall(); // Reset position and give random velocity
		}
	}

	// Callback opponent paddle
	_updateBotPaddle(): void {
		if (this.engineRunning === false)
			this.thrower.throwGameExcp(
				`simulation is not running`,
				this.sessionToken,
				`${SimulationService.name}._updateBotPaddle()`,
			);

		if (this.ball.x > this.windowWidth / 2) {
			if (this.ball.y < this.player2.posY - 30)
				this.movePaddle(this.botName, GameTypes.PaddleDirection.up);
			else if (this.ball.y > this.player2.posY + 30)
				this.movePaddle(this.botName, GameTypes.PaddleDirection.down);
		}
	}

	_randomDelta(): { dx: number; dy: number } {
		const randomX = Math.random() * (Math.sqrt(3) / 2 - 1) + 1; // between [rad(3)/2, 1] = [cos(+-30), cos(0)]
		const randomY = Math.random() * (0.5 + 0.5) - 0.5; // between [-1/2, 1/2] = [sin(-30), sin(30)]
		const randomDirection = Math.random() < 0.5 ? -1 : 1; // random between -1 and 1
		const speed = 10; // You can adjust this value for ball speed

		const deltaX = randomX * randomDirection * speed;
		const deltaY = randomY * speed;
		return { dx: deltaX, dy: deltaY };
	}

	_resetBall(): void {
		this.ball.x = this.windowWidth / 2; // Reset to center of the screen
		this.ball.y = this.windowHeight / 2;

		const randomDelta = this._randomDelta();
		this.ball.dx = randomDelta.dx;
		this.ball.dy = randomDelta.dy;
	}

	_paddleHit(player_y: number, isLeftPaddle: boolean): number | null {
		const collisionZone = Math.abs(player_y - this.ball.y);
		if (isLeftPaddle) {
			if (this.ball.x <= this.paddleWidth && collisionZone <= this.paddleHeight / 2)
				return player_y - this.ball.y; // Return offset
		} else {
			if (
				this.ball.x >= this.windowWidth - this.paddleWidth &&
				collisionZone <= this.paddleHeight / 2
			)
				return player_y - this.ball.y; // Return offset
		}
		return null; // No collision
	}

	_sendMsgToPlayer(client: Socket, msg: string, data?: any) {
		// console.log(this.logger.isLevelEnabled('log'));
		// console.log(this.logger.isLevelEnabled('debug'));
		this.logger.debug(
			`session [${this.sessionToken}] - emitting to client ${client.id} data: ${JSON.stringify(data)}`,
		);

		client.emit(msg, data);
	}

	// if a player disconnects unexpectedly
	handleDisconnect(client: Socket): void {
		if (this.engineRunning === false) return;

		if (this.mode === GameTypes.GameMode.multi) {
			if (this.player1 && this.player1.clientSocket.id === client.id) {
				this.logger.log(
					`session [${this.sessionToken}] - game stopped, player ${this.player1.nameNick} left the game`,
				);

				if (this.mode === GameTypes.GameMode.multi)
					this._sendMsgToPlayer(
						this.player2.clientSocket,
						'gameError',
						`Game interrupted, player ${this.player1.nameNick} left the game`,
					);
			} else if (this.player2 && this.player2.clientSocket.id === client.id) {
				this.logger.log(
					`session [${this.sessionToken}] - game stopped, player ${this.player2.nameNick} left the game`,
				);

				if (this.mode === GameTypes.GameMode.multi)
					this._sendMsgToPlayer(
						this.player1.clientSocket,
						'gameError',
						`Game interrupted, player ${this.player2.nameNick} left the game`,
					);
			}
		}

		this.stopEngine();
	}

	// if the game ends gracefully
	endGame(winner: GameTypes.Player): void {
		if (this.engineRunning === false)
			this.thrower.throwGameExcp(
				`simulation is not running`,
				this.sessionToken,
				`${SimulationService.name}.endGame()`,
			);

		this.logger.log(`session [${this.sessionToken}] - game over, winner: ${winner.nameNick}`);

		if (this.player1)
			this._sendMsgToPlayer(this.player1.clientSocket, 'endGame', { winner: winner.nameNick });

		if (this.player2 && this.mode === GameTypes.GameMode.multi)
			this._sendMsgToPlayer(this.player2.clientSocket, 'endGame', { winner: winner.nameNick });

		this.stopEngine();
	}

	// for server error
	interruptGame(trace: string): void {
		if (this.player1)
			this._sendMsgToPlayer(this.player1.clientSocket, 'gameError', `Game error - ${trace}`);

		if (this.player2 && this.mode === GameTypes.GameMode.multi)
			this._sendMsgToPlayer(this.player2.clientSocket, 'gameError', `Game error - ${trace}`);

		this.stopEngine();

		if (this.gameSetupInterval) clearInterval(this.gameSetupInterval);
	}

	checkClientId(clientId: string): boolean {
		if (!this.player1 || !this.player2) return false;

		return clientId === this.player1.clientSocket.id || clientId === this.player2.clientSocket.id;
	}
}
