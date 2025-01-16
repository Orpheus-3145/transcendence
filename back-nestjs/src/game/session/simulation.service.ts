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
	private readonly _defaultBallSpeed = parseInt(this.config.get('GAME_BALL_SPEED'), 10);
	private readonly frameRate: number = parseInt(this.config.get('GAME_FPS'), 10);

	// Extras
	private extras: boolean = false;

	// Speed Ball
	private powerUpInterval: NodeJS.Timeout = null; // Timer for spawning speedball
	private speedBallActive: boolean = false;
	private powerUpPosition = { x: this.windowWidth / 2, y: this.windowHeight / 2, dx: 0, dy: 0 };

	// Power up type
	// Randomly choose between powerUpTypes each time
	private powerUpType: { [key: string]: boolean } = {
		speedBall: false,
		speedPaddle: false,
		slowPaddle: false,
		shrinkPaddle: false,
		strechtPaddle: false,
	};
	private powerUpIntervalTime: number = 15000; // NB move in env file
	// Power-up state
	private powerUpStatus: { [key: number]: boolean } = { 0: false, 1: false }; // power up statusfor player
	private powerUpDuration: number = 8000; // Duration for power-up in ms (e.g., 5 seconds) NB move in env file

	private sessionToken: string;
	private mode: GameTypes.GameMode = GameTypes.GameMode.unset;
	private forbidAutoPlay: boolean = this.config.get<boolean>('FORBID_AUTO_PLAY', false); // if true the same user cannot play against themself

	private engineRunning: boolean = false;
	private gameOver: boolean = false;
	private player1: GameTypes.Player = null;
	private player2: GameTypes.Player = null;
	private ballSpeed: number = this._defaultBallSpeed;
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

	setInitInfo(sessionToken: string, mode: GameTypes.GameMode, extras: boolean) {
		this.sessionToken = sessionToken;
		this.mode = mode;
		this.extras = extras;

		// add bot if single mode
		if (this.mode === GameTypes.GameMode.single) this.addPlayer(null, -1, this.botName);

		this.gameSetupInterval = setInterval(() => {
			// missing info, not ready to play yet
			if (!this.player1 || !this.player2) return;

			console.log('ready');
			if (this.forbidAutoPlay == true && this.player1.nameNick == this.player2.nameNick)
				this.interruptGame(`cannot play against yourself: ${this.player1.nameNick}`);
			
			this.startEngine();
		}, this.frameRate);
	}

	startEngine(): void {
		console.log('trying to start engine');
		if (this.engineRunning) return;

		this.engineRunning = true;

		clearInterval(this.gameSetupInterval);
		this.gameSetupInterval = null;

		this.gameStateInterval = setInterval(() => this.gameIteration(), this.frameRate);
		this.logger.debug(`session [${this.sessionToken}] - player1: ${this.player1.nameNick}`);
		this.logger.debug(`session [${this.sessionToken}] - player2: ${this.player2.nameNick}`);
		this.logger.log(`session [${this.sessionToken}] - game started`);

		this.resetBall();
		this.sendUpdateToPlayers('gameStart');

		// Extra power up
		if (this.extras) {
			this.startSpeedBallTimer(); // Start speedball timer
		}
	}

	stopEngine(): void {
		if (this.engineRunning === false) return;

		clearInterval(this.gameStateInterval);
		this.gameStateInterval = null;

		if (this.extras) {
			clearInterval(this.powerUpInterval);
			this.powerUpInterval = null;
		}

		// if one of the two players have a powerup active
		if (this.powerUpStatus[0])
			this.removePowerUp(0);
		else if (this.powerUpStatus[1])
			this.removePowerUp(1);

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
			this.updateBall();

			if (this.mode === GameTypes.GameMode.single) this.updateBotPaddle();

			this.sendSpeedBallUpdate();
			if (this.gameOver) {
				if (this.player2.score === this.maxScore) this.endGame(this.player2);
				else this.endGame(this.player1);
			} else this.sendUpdateToPlayers('gameState');
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
		this.logger.debug(`session [${this.sessionToken}] - added player ${newPlayer.nameNick} to game`);
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

	sendUpdateToPlayers(msgType: string) {
		if (this.engineRunning === false)
			this.thrower.throwGameExcp(
				`simulation is not running`,
				this.sessionToken,
				`${SimulationService.name}.sendUpdateToPlayers()`,
			);

		const dataPlayer1: GameStateDTO = {
			ball: { x: this.ball.x, y: this.ball.y },
			p1: { y: this.player1.posY },
			p2: { y: this.player2.posY },
			score: { p1: this.player1.score, p2: this.player2.score },
		};

		this.sendMsgToPlayer(this.player1.clientSocket, msgType, dataPlayer1);

		// Here we flip the players to make sure each player is on the left in the FrontEnd
		if (this.mode === GameTypes.GameMode.multi) {
			const dataPlayer2: GameStateDTO = {
				ball: { x: this.windowWidth - this.ball.x, y: this.ball.y },
				p1: { y: this.player2.posY },
				p2: { y: this.player1.posY },
				score: { p1: this.player2.score, p2: this.player1.score },
			};

			this.sendMsgToPlayer(this.player2.clientSocket, msgType, dataPlayer2);
		}
	}

	// Callback ball
	updateBall(): void {
		if (this.engineRunning === false)
			this.thrower.throwGameExcp(
				`simulation is not running`,
				this.sessionToken,
				`${SimulationService.name}.updateBall()`,
			);

		// Move the ball
		this.ball.x += this.ball.dx * this.ballSpeed;
		this.ball.y += this.ball.dy * this.ballSpeed;

		// Bounce off top and bottom walls
		if (this.ball.y <= 0 || this.ball.y >= this.windowHeight) {
			this.ball.dy = -this.ball.dy;
		}

		// Collision detection with paddles
		const leftPaddleOffset = this.paddleHit(this.player1.posY, this.ball.x, this.ball.y, true);
		const rightPaddleOffset = this.paddleHit(this.player2.posY, this.ball.x, this.ball.y, false);
		const maxAngle = Math.PI / 4; // Maximum bounce angle from paddle center (45 degrees)

		if (leftPaddleOffset !== null) {
			// Calculate new `dy` based on the offset from the center of the paddle
			const normalizedOffset = leftPaddleOffset / (this.paddleHeight / 2); // -1 to 1 range
			const angle = normalizedOffset * maxAngle;
			this.ball.dx = Math.abs(this.ball.dx); // Move right
			this.ball.dy = Math.tan(angle) * Math.abs(this.ball.dx); // Set dy based on angle
			this.addPowerUp(0);
		} else if (rightPaddleOffset !== null) {
			const normalizedOffset = rightPaddleOffset / (this.paddleHeight / 2); // -1 to 1 range
			const angle = normalizedOffset * maxAngle;
			this.ball.dx = -Math.abs(this.ball.dx); // Move left
			this.ball.dy = Math.tan(angle) * Math.abs(this.ball.dx);
			this.addPowerUp(1); // Set dy based on angle
		}

		// Check for scoring
		if (this.ball.x <= 0) {
			// point for player2
			this.player2.score += 1;
			if (this.player2.score === this.maxScore) this.gameOver = true;
			else this.resetBall(); // Reset position and give random velocity
		} else if (this.ball.x >= this.windowWidth) {
			// point for player1
			this.player1.score += 1;
			if (this.player1.score === this.maxScore) this.gameOver = true;
			else this.resetBall(); // Reset position and give random velocity
		}
	}

	// Callback opponent paddle
	updateBotPaddle(): void {
		// The bot will catch the ball if it is in the half of the window near the right paddle
		if (this.engineRunning === false)
			this.thrower.throwGameExcp(
				`simulation is not running`,
				this.sessionToken,
				`${SimulationService.name}.updateBotPaddle()`,
			);

		// The 30 is to prevent the paddle from getting stuck when the y coordinate is the same. Allows smooth movement.
		if (this.mode === GameTypes.GameMode.single) {
			if (this.ball.x > this.windowWidth / 2) {
				if (this.ball.y < this.player2.posY - 30)
					this.movePaddle(this.botName, GameTypes.PaddleDirection.up);
				else if (this.ball.y > this.player2.posY + 30)
					this.movePaddle(this.botName, GameTypes.PaddleDirection.down);
			} else {
				// Else the bot will catch the power up
				if (this.powerUpPosition.y < this.player2.posY - 30)
					this.movePaddle(this.botName, GameTypes.PaddleDirection.up);
				else if (this.powerUpPosition.y > this.player2.posY + 30)
					this.movePaddle(this.botName, GameTypes.PaddleDirection.down);
			}
		}
	}

	randomDelta(): { dx: number; dy: number } {
		const randomX = Math.random() * (Math.sqrt(3) / 2 - 1) + 1; // between [rad(3)/2, 1] = [cos(+-30), cos(0)]
		const randomY = Math.random() * (0.5 + 0.5) - 0.5; // between [-1/2, 1/2] = [sin(-30), sin(30)]
		const randomDirection = Math.random() < 0.5 ? -1 : 1; // random between -1 and 1
		const speed = 10; // You can adjust this value for ball speed

		const deltaX = randomX * randomDirection * speed;
		const deltaY = randomY * speed;
		return { dx: deltaX, dy: deltaY };
	}

	resetBall(): void {
		this.ball.x = this.windowWidth / 2; // Reset to center of the screen
		this.ball.y = this.windowHeight / 2;

		const randomDelta = this.randomDelta();
		this.ball.dx = randomDelta.dx;
		this.ball.dy = randomDelta.dy;
		this.ballSpeed = this._defaultBallSpeed;
	}

	paddleHit(
		player_y: number,
		item_x: number,
		item_y: number,
		isLeftPaddle: boolean,
	): number | null {
		// throw excp if engine is not running
		const collisionZone = Math.abs(player_y - item_y);
		if (isLeftPaddle) {
			if (item_x <= this.paddleWidth && collisionZone <= this.paddleHeight / 2)
				return player_y - item_y; // Return offset
		} else {
			if (item_x >= this.windowWidth - this.paddleWidth && collisionZone <= this.paddleHeight / 2)
				return player_y - item_y; // Return offset
		}
		return null; // No collision
	}

	// If speedBall power up is  active for player, increase speed x2
	// Add more power ups here
	addPowerUp(player: number): void {
		this.ballSpeed =
			this.powerUpStatus[player] === true ? this._defaultBallSpeed * 2 : this._defaultBallSpeed;
	}

	// Extras / Power Ups
	startSpeedBallTimer(): void {
		this.powerUpInterval = setInterval(() => {
			this.powerUpIntervalTime = Math.random() * (20000 - 10000) + 10000;
			this.spawnSpeedBall();
		}, this.powerUpIntervalTime);
	}

	spawnSpeedBall(): void {
		if (this.speedBallActive) {
			return; // If speed ball is already active, do nothing
		}
		const spawnX = this.windowWidth / 2;
		const spawnY = Math.random() * (this.windowHeight - 50) + 25; // Random Y position within bounds
		const randomDirX = Math.random() < 0.5 ? -1 : 1;
		
		// if randomDirX == 1 towards player2, else towards player1
		this.powerUpPosition = { x: spawnX, y: spawnY, dx: randomDirX, dy: 0 };
		this.speedBallActive = true;
	}

	sendSpeedBallUpdate(): void {
		if (this.speedBallActive) {
			this.powerUpPosition.x += this.powerUpPosition.dx * 5;
			// this.powerUpPosition.y += this.powerUpPosition.dy * 5;
			// Later add type of power up to this return data type
			let speedBallData = {
				x: this.powerUpPosition.x,
				y: this.powerUpPosition.y,
			};
			// ball: { x: this.windowWidth - this.ball.x, y: this.ball.y },
			this.sendMsgToPlayer(this.player1.clientSocket, 'speedBallUpdate', speedBallData)
			if (this.mode === GameTypes.GameMode.multi) {
				speedBallData.x = this.windowWidth - this.powerUpPosition.x
				this.sendMsgToPlayer(this.player2.clientSocket, 'speedBallUpdate', speedBallData)
			}

			// the direction of the power up has to be mirrored between the two players
			// if (this.powerUpPosition.dx === 1) {	// the powerup is going towards player2, opposite to player1
				
			// 	if (this.mode === GameTypes.GameMode.multi) {
			// 		this.sendMsgToPlayer(this.player2.clientSocket, 'speedBallUpdate', speedBallData)
			// 	}
			// 	// is getting far to player1
			// 	speedBallData.x = this.windowWidth - speedBallData.x;
			// 	this.sendMsgToPlayer(this.player1.clientSocket, 'speedBallUpdate', speedBallData)
				
			// } else {	// the powerup is going towards player1, opposite to player2
				
			// 	this.sendMsgToPlayer(this.player1.clientSocket, 'speedBallUpdate', speedBallData)
			// 	if (this.mode === GameTypes.GameMode.multi) {
			// 		speedBallData.x = this.windowWidth - speedBallData.x;
			// 		this.sendMsgToPlayer(this.player2.clientSocket, 'speedBallUpdate', speedBallData)
			// 	}
			// }

			const leftPaddle = this.paddleHit(
				this.player1.posY,
				this.powerUpPosition.x,
				this.powerUpPosition.y,
				true,
			);

			const rightPaddle = this.paddleHit(
				this.player2.posY,
				this.powerUpPosition.x,
				this.powerUpPosition.y,
				false,
			);
			
			if (leftPaddle != null)
				this.handlePowerUpCollisionWithPaddle(0);
			else if (rightPaddle != null)
				this.handlePowerUpCollisionWithPaddle(1);
			
			if (this.powerUpPosition.x <= 0 || this.powerUpPosition.x >= this.windowWidth) {
				this.deactivateSpeedBall();
			}
		}
	}

	deactivateSpeedBall(): void {
		this.speedBallActive = false;

		// Notify players that the speed ball has been deactivated
		if (this.player1) {
			this.sendMsgToPlayer(this.player1.clientSocket, 'speedBallDeactivated'); // yellow ball disappears
		}
		if (this.mode == GameTypes.GameMode.multi) {
			this.sendMsgToPlayer(this.player2.clientSocket, 'speedBallDeactivated');
		}
	}

	handlePowerUpCollisionWithPaddle(player_no: number): void {
		this.powerUpStatus[player_no] = true;

		console.log(`Player collision ${player_no + 1}`)
		const playerIdentity1 =
			player_no === 0 ? GameTypes.PlayerIdentity.self : GameTypes.PlayerIdentity.opponent;
		this.sendPowerUpData(this.player1, player_no, playerIdentity1, true);
		if (this.mode === GameTypes.GameMode.multi) {
			const playerIdentity2 =
				player_no === 1 ? GameTypes.PlayerIdentity.self : GameTypes.PlayerIdentity.opponent;
			this.sendPowerUpData(this.player2, player_no, playerIdentity2, true);
		}
		// Set a timer to remove the power-up after the duration
		setTimeout(() => {
			if (this.engineRunning)
				this.removePowerUp(player_no);
		}, this.powerUpDuration);

		// Deactivate the speedball after collision
		this.deactivateSpeedBall();
	}

	removePowerUp(player_no: number): void {
		// Remove the power-up status
		this.powerUpStatus[player_no] = false;
		const playerIdentity1 =
			player_no === 0 ? GameTypes.PlayerIdentity.self : GameTypes.PlayerIdentity.opponent;
		this.sendPowerUpData(this.player1, player_no, playerIdentity1, false);
		if (this.mode === GameTypes.GameMode.multi) {
			const playerIdentity2 =
				player_no === 1 ? GameTypes.PlayerIdentity.self : GameTypes.PlayerIdentity.opponent;
			this.sendPowerUpData(this.player2, player_no, playerIdentity2, false);
		}
	}

	sendPowerUpData(
		playerBonus: GameTypes.Player,
		player_no: number,
		player_id: number,
		active: boolean,
	) {
		const powerUpStatus = {
			active: active,
			player: player_id,
		};
		this.sendMsgToPlayer(playerBonus.clientSocket, 'powerUpActivated', powerUpStatus); // Color turns back to original paddle colour
	}

	sendMsgToPlayer(client: Socket, msg: string, data?: any) {
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
					this.sendMsgToPlayer(
						this.player2.clientSocket,
						'gameError',
						`Game interrupted, player ${this.player1.nameNick} left the game`,
					);
			} else if (this.player2 && this.player2.clientSocket.id === client.id) {
				this.logger.log(
					`session [${this.sessionToken}] - game stopped, player ${this.player2.nameNick} left the game`,
				);

				if (this.mode === GameTypes.GameMode.multi)
					this.sendMsgToPlayer(
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
			this.sendMsgToPlayer(this.player1.clientSocket, 'endGame', { winner: winner.nameNick });

		if (this.player2 && this.mode === GameTypes.GameMode.multi)
			this.sendMsgToPlayer(this.player2.clientSocket, 'endGame', { winner: winner.nameNick });

		this.stopEngine();
	}

	// for server error
	interruptGame(trace: string): void {
		if (this.player1)
			this.sendMsgToPlayer(this.player1.clientSocket, 'gameError', `Game error - ${trace}`);

		if (this.player2 && this.mode === GameTypes.GameMode.multi)
			this.sendMsgToPlayer(this.player2.clientSocket, 'gameError', `Game error - ${trace}`);

		this.stopEngine();

		if (this.gameSetupInterval) clearInterval(this.gameSetupInterval);
	}

	checkClientId(clientId: string): boolean {
		if (!this.player1 || !this.player2) return false;

		return clientId === this.player1.clientSocket.id || clientId === this.player2.clientSocket.id;
	}
}