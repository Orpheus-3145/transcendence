import { Injectable, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

import GameStateDTO from 'src/dto/gameState.dto';
import GameSizeDTO from 'src/dto/gameSize.dto'
import * as GameTypes from 'src/game/game.types';
import AppLoggerService from 'src/log/log.service';
import ExceptionFactory from 'src/errors/exceptionFactory.service';
import GameDataDTO from 'src/dto/gameData.dto';
import PlayerDataDTO from 'src/dto/playerData.dto';


@Injectable({ scope: Scope.TRANSIENT })
export default class SimulationService {
	// generic game data
	private readonly maxScore: number = parseInt(this.config.get('GAME_MAX_SCORE'), 10);
	private readonly botName: string = this.config.get<string>('GAME_BOT_NAME', 'DTR');
	private readonly frameRateUpdate: number = parseInt(this.config.get('GAME_FPS'), 10);
	private readonly hardDebugMode: boolean = this.config.get<boolean>('HARD_DEBUG_MODE', false);
	private readonly forbidAutoPlay: boolean = this.config.get<boolean>('GAME_FORBID_AUTO_PLAY', false);
	// gamte item sizes
	private readonly windowWidth: number = parseInt(this.config.get('GAME_WIDTH'), 10);
	private readonly windowHeight: number = parseInt(this.config.get('GAME_HEIGHT'), 10);
	private readonly paddleWidth: number = parseInt(this.config.get('GAME_PADDLE_WIDTH'), 10);
	private readonly _defaultPaddleHeight: number = parseInt(this.config.get('GAME_PADDLE_HEIGHT'), 10);
	private readonly _defaultpaddleSpeed: number = parseInt(this.config.get('GAME_PADDLE_SPEED'), 10);
	private readonly _highPaddleSpeed: number = parseInt(this.config.get('GAME_PADDLE_HIGH_SPEED'), 10);
	private readonly _lowPaddleSpeed: number = parseInt(this.config.get('GAME_PADDLE_LOW_SPEED'), 10);
	private readonly ballRadius: number = Number(this.config.get('GAME_BALL_RADIUS'));
	private readonly _defaultBallSpeed: number = parseInt(this.config.get('GAME_BALL_SPEED'), 10);
	// game data
	private sessionToken: string = '';
	private mode: GameTypes.GameMode = GameTypes.GameMode.unset;
	private difficulty: GameTypes.GameDifficulty = GameTypes.GameDifficulty.unset;
	private powerUpSelected: GameTypes.PowerUpType[] = new Array();
	// players data
	private player1: GameTypes.PlayingPlayer = null;
	private player2: GameTypes.PlayingPlayer = null;

	private engineRunning: boolean = false;
	private gameOver: boolean = false;
	private waitingForRematch: boolean = false;
	private ballSpeed: number = this._defaultBallSpeed;
	private ball = { x: this.windowWidth / 2, y: this.windowHeight / 2, dx: 5, dy: 5 };
	// Power-up
	private paddleSpeed: number[] = [this._defaultpaddleSpeed, this._defaultpaddleSpeed];
	private powerUpIntervalTime: number = Number(this.config.get<number>('GAME_POWERUP_CYCLE_TIME', 15000));
	// Power-up state
	private powerUpStatus: boolean[] = [false, false]; // Power up status for players
	private powerUpDuration: number = Number(this.config.get<number>('GAME_POWERUP_DURATION', 8000)); // Duration for power-up
	private powerUpActive: boolean = false; // Is powerUp active or not? Maybe we can remove this.
	private powerUpPosition = { x: this.windowWidth / 2, y: this.windowHeight / 2, dx: 0, dy: 0 };
	private paddleHeights: number[] = [this._defaultPaddleHeight, this._defaultPaddleHeight];
	private powerUpType: GameTypes.PowerUpType;
	// intervals for periodic updates
	private gameStateInterval: NodeJS.Timeout = null; // loop for setting up the game
	private gameSetupInterval: NodeJS.Timeout = null; // engine loop: data emitter to client(s)
	private powerUpInterval: NodeJS.Timeout = null; // Timer for spawning power up

	constructor(
		private readonly logger: AppLoggerService,
		private readonly thrower: ExceptionFactory,
		private readonly config: ConfigService,
	) {
		this.logger.setContext(SimulationService.name);
		if (this.config.get<boolean>('DEBUG_MODE_GAME', false) == false)
			this.logger.setLogLevels(['log', 'warn', 'error', 'fatal']);
	}

	setGameData(data: GameDataDTO): void {
		if (
			data.mode === GameTypes.GameMode.unset ||
			(data.mode === GameTypes.GameMode.single &&
				data.difficulty === GameTypes.GameDifficulty.unset) ||
			data.sessionToken === ''
		)
			this.thrower.throwGameExcp(
				`Invalid data received: ${JSON.stringify(data)}`,
				data.sessionToken,
				`${SimulationService.name}.${this.constructor.prototype.setInitInfo.name}()`,
			);
			this.sessionToken = data.sessionToken;
			this.mode = data.mode;
			this.difficulty = data.difficulty;
			this.powerUpSelected = data.extras;
			
		this.logger.log(`session [${data.sessionToken}] - room created`);
		this.logger.log(`session [${this.sessionToken}] - new game, mode: ${this.mode}`);
		this.logger.log(`session [${this.sessionToken}] - new game, powerups: [${this.powerUpSelected.join(', ')}]`);
		if (this.mode === GameTypes.GameMode.single)
			this.logger.log(`session [${this.sessionToken}] - new game, difficulty: ${this.difficulty}`);

		// add bot if single mode
		if (this.mode === GameTypes.GameMode.single) {
			const botPlayer: PlayerDataDTO = {
				playerId: -1,
				nameNick: this.botName,
				sessionToken: this.sessionToken
			}
			this.addPlayer(botPlayer, null);
		}

		this.gameSetupInterval = setInterval(() => {
			// missing info, not ready to play yet
			if (!this.player1 || !this.player2) return;

			if (this.forbidAutoPlay === true && this.player1.intraId === this.player2.intraId)
				this.interruptGame(`cannot play against yourself`);

			this.logger.log(`session [${this.sessionToken}] - player1: ${this.player1.nameNick}`);
			this.logger.log(`session [${this.sessionToken}] - player2: ${this.player2.nameNick}`);
			
			// received all data, game can start
			this.startEngine();
		}, this.frameRateUpdate);
	}

	addPlayer(data: PlayerDataDTO, client: Socket): void {
		if (this.engineRunning)
			this.thrower.throwGameExcp(
				`tried to add player ${data.nameNick}, but game has started already`,
				this.sessionToken,
				`${SimulationService.name}.${this.constructor.prototype.addPlayer.name}()`,
			);

		const newPlayer: GameTypes.PlayingPlayer = {
			clientSocket: client,
			intraId: data.playerId,
			nameNick: data.nameNick,
			score: 0,
			posX: 0,
			posY: this.windowHeight / 2,
		};

		if (data.playerId === -1) {		// set bot, always player2
			this.player2 = newPlayer;
			this.player2.posX = this.windowWidth - this.paddleWidth / 2;
		}
		else if (this.player1 === null){
			this.player1 = newPlayer;
			this.player1.posX = this.paddleWidth / 2;
		}
		else if (this.player2 === null) {
			this.player2 = newPlayer;
			this.player2.posX = this.windowWidth - this.paddleWidth / 2;
		}
		else {
			if (data.playerId === this.player1.intraId || data.playerId === this.player2.intraId)	// already inside game
				this.thrower.throwGameExcp(
					`${data.nameNick} is already in this game`,
					this.sessionToken,
					`${SimulationService.name}.${this.constructor.prototype.addPlayer.name}`,
				);
			else		// unknown player
				this.thrower.throwGameExcp(
					`room full, failed to add ${data.nameNick} to game`,
					this.sessionToken,
					`${SimulationService.name}.${this.constructor.prototype.addPlayer.name}`,
				);
		}
		if (data.playerId === -1)
			this.logger.debug(`session [${this.sessionToken}] - bot added to game`);
		else 
			this.logger.debug(`session [${this.sessionToken}] - ${data.nameNick} added to game`);
	}

	startEngine(): void {
		if (this.engineRunning) return;	// NB or throw error?

		this.engineRunning = true;

		clearInterval(this.gameSetupInterval);
		this.gameSetupInterval = null;

		this.gameStateInterval = setInterval(() => this.gameIteration(), this.frameRateUpdate);

		this.resetBall();
		
		// if at least one powerup is select start spawning timer
		if (this.powerUpSelected.length > 0)
			this.startPowerUpTimer();

		const sizeGame: GameSizeDTO = {width: this.windowWidth, height: this.windowHeight}
		this.sendMsgToPlayer(this.player1.clientSocket, 'gameStart', sizeGame);
		if (this.mode === GameTypes.GameMode.multi)
			this.sendMsgToPlayer(this.player2.clientSocket, 'gameStart', sizeGame);

		this.logger.debug(`session [${this.sessionToken}] - engine started`);
	}

	gameIteration(): void {
		try {
			this.updateBall();

			if (this.mode === GameTypes.GameMode.single)
				this.updateBotPaddle();

			if (this.powerUpActive === true)
				this.sendPowerUpUpdate();
	
			this.sendUpdateToPlayers('gameState');

			if (this.gameOver) {
				if (this.player2.score === this.maxScore)
					this.endGame(this.player2);
				else 
					this.endGame(this.player1);
			}
		} catch (error) {
			this.interruptGame(error.message);
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
		if (this.ball.y <= this.ballRadius || this.ball.y >= this.windowHeight - this.ballRadius )
			this.ball.dy = -this.ball.dy;

		// Collision detection with paddles
		const leftPaddleOffset = this.paddleHit(0, this.ball.x, this.ball.y);
		const rightPaddleOffset = this.paddleHit(1, this.ball.x, this.ball.y);
		const maxAngle = Math.PI / 4; // Maximum bounce angle from paddle center (45 degrees)

		if (leftPaddleOffset !== null) {
			// Calculate new `dy` based on the offset from the center of the paddle
			const normalizedOffset = leftPaddleOffset / (this.paddleHeights[0] / 2); // -1 to 1 range
			const angle = normalizedOffset * maxAngle;
			this.ball.dx = Math.abs(this.ball.dx); // Move right
			this.ball.dy = Math.tan(angle) * Math.abs(this.ball.dx); // Set dy based on angle
			this.addSpeedBall(0);
		} else if (rightPaddleOffset !== null) {
			const normalizedOffset = rightPaddleOffset / (this.paddleHeights[1] / 2); // -1 to 1 range
			const angle = normalizedOffset * maxAngle;
			this.ball.dx = -Math.abs(this.ball.dx); // Move left
			this.ball.dy = Math.tan(angle) * Math.abs(this.ball.dx);
			this.addSpeedBall(1); // Set dy based on angle
		}

		// Check for scoring
		if (this.ball.x <= this.ballRadius * 0.5) {
			// point for player2
			this.player2.score += 1;
			if (this.player2.score === this.maxScore) this.gameOver = true;
			else this.resetBall(); // Reset position and give random velocity
		} else if (this.ball.x >= this.windowWidth - this.ballRadius * 0.5) {
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
			// If the ball in the second half and moving in the direction of the bot && this.ball.dx > 0
			if (this.ball.x > this.windowWidth / 2) {
				if (this.ball.y < this.player2.posY - 30)
					this.movePaddle(this.player2, GameTypes.PaddleDirection.up);
				else if (this.ball.y > this.player2.posY + 30)
					this.movePaddle(this.player2, GameTypes.PaddleDirection.down);
			} else {
				// Else the bot will catch the power up
				if (this.powerUpPosition.y < this.player2.posY - 30)
					this.movePaddle(this.player2, GameTypes.PaddleDirection.up);
				else if (this.powerUpPosition.y > this.player2.posY + 30)
					this.movePaddle(this.player2, GameTypes.PaddleDirection.down);
			}
		}
	}

	sendPowerUpUpdate(): void {
		if (this.engineRunning === false)
			this.thrower.throwGameExcp(
				`simulation is not running`,
				this.sessionToken,
				`${SimulationService.name}.sendUpdateToPlayers()`,
			);

		this.powerUpPosition.x += this.powerUpPosition.dx * 5;
		// Later add type of power up to this return data type
		let powerUpData = {
			x: this.powerUpPosition.x,
			y: this.powerUpPosition.y,
		};

		this.sendMsgToPlayer(this.player1.clientSocket, 'powerUpUpdate', powerUpData);
		if (this.mode === GameTypes.GameMode.multi) {
			powerUpData.x = this.windowWidth - this.powerUpPosition.x;
			this.sendMsgToPlayer(this.player2.clientSocket, 'powerUpUpdate', powerUpData);
		}

		if (this.paddleHit(0, this.powerUpPosition.x, this.powerUpPosition.y))
			this.handlePowerUpCollisionWithPaddle(0);
		else if (this.paddleHit(1, this.powerUpPosition.x, this.powerUpPosition.y))
			this.handlePowerUpCollisionWithPaddle(1);

		if (this.powerUpPosition.x <= this.ballRadius || this.powerUpPosition.x >= this.windowWidth - this.ballRadius)
			this.deactivatePowerUp();
	}

	sendUpdateToPlayers(msgType: string): void {
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

	// if the game ends gracefully
	endGame(winner: GameTypes.PlayingPlayer): void {
		if (this.engineRunning === false)
			this.thrower.throwGameExcp(
				`simulation is not running`,
				this.sessionToken,
				`${SimulationService.name}.endGame()`,
			);

		this.logger.log(`session [${this.sessionToken}] - game over, winner: ${winner.nameNick}`);

		this.sendMsgToPlayer(this.player1.clientSocket, 'endGame', winner.nameNick);
		if (this.mode === GameTypes.GameMode.multi)
			this.sendMsgToPlayer(this.player2.clientSocket, 'endGame', winner.nameNick);

		this.stopEngine();

		this.logger.debug(`session [${this.sessionToken}] - rematch phase`);
		this.waitingForRematch = true;
	}

	// if a player disconnects unexpectedly
	handleDisconnect(leavingPlayer: GameTypes.PlayingPlayer): void {
		
		if (this.engineRunning === true) {
			this.logger.log(`session [${this.sessionToken}] - game interrupted, ${leavingPlayer.nameNick} left the game`);
			
			if (this.mode === GameTypes.GameMode.multi) {
				if (this.player1.intraId === leavingPlayer.intraId)
					this.sendMsgToPlayer(this.player2.clientSocket, 'gameError', `Game interrupted, ${leavingPlayer.nameNick} left the game`);
				else if (this.player2.intraId === leavingPlayer.intraId)
					this.sendMsgToPlayer(this.player1.clientSocket, 'gameError', `Game interrupted, ${leavingPlayer.nameNick} left the game`);
			}

		} else if (this.waitingForRematch === true) {
			this.logger.log(`session [${this.sessionToken}] - rematch aborted, ${leavingPlayer.nameNick} left the queue`);

			if (this.mode === GameTypes.GameMode.multi) {
				if (this.player1.intraId === leavingPlayer.intraId)
					this.sendMsgToPlayer(this.player2.clientSocket, 'abortRematch', `${leavingPlayer.nameNick} left the queue`);
				else if (this.player2.intraId === leavingPlayer.intraId)
					this.sendMsgToPlayer(this.player1.clientSocket, 'abortRematch', `${leavingPlayer.nameNick} left the queue`);
			}
		}

		if (this.engineRunning === true)
			this.stopEngine();
		this.terminateSimulation();
	}
	// for server error
	interruptGame(trace: string): void {

		this.logger.error(`session [${this.sessionToken}] - interrupting simulation, error occurred: ${trace}`);
		
		if (this.player1)
			this.sendMsgToPlayer(this.player1.clientSocket, 'gameError', `Game error - ${trace}`);

		if (this.player2 && this.mode === GameTypes.GameMode.multi)
			this.sendMsgToPlayer(this.player2.clientSocket, 'gameError', `Game error - ${trace}`);

		this.stopEngine();
		this.terminateSimulation();
	}

	stopEngine(): void {

		if (this.gameSetupInterval) {
			clearInterval(this.gameSetupInterval);
			this.gameSetupInterval = null;
		}

		if (this.engineRunning === false)
			return;

		clearInterval(this.gameStateInterval);
		this.gameStateInterval = null;

		// if players are using powerups
		if (this.powerUpSelected.length > 0) {
			clearInterval(this.powerUpInterval);
			this.powerUpInterval = null;
			
			if (this.powerUpStatus[0])
				this.removePowerUp(0);
			if (this.powerUpStatus[1])
				this.removePowerUp(1);
		}

		this.engineRunning = false;
		this.gameOver = false;
		this.ballSpeed = this._defaultBallSpeed
		this.ball = { x: this.windowWidth / 2, y: this.windowHeight / 2, dx: 5, dy: 5 };

		this.logger.debug(`session [${this.sessionToken}] - engine stopped`);
	}

	terminateSimulation(): void {

		if (this.player1 !== null) {
			this.player1.clientSocket.disconnect(true);
			this.player1 = null;
		}
		if (this.player2 !== null) {
			if (this.mode === GameTypes.GameMode.multi)
				this.player2.clientSocket.disconnect(true);
			this.player2 = null;
		}
	}

	askForRematch(player: GameTypes.PlayingPlayer): void {

		if (this.mode === GameTypes.GameMode.single)
			this.acceptRematch(player);
		else if (this.mode === GameTypes.GameMode.multi) {
			
			this.logger.debug(`session [${this.sessionToken}] - ${player.nameNick} proposed a rematch`);
			if (this.player1.intraId === player.intraId)
				this.sendMsgToPlayer(this.player2.clientSocket, 'askForRematch', `${player.nameNick} proposed a rematch`);
			else if (this.player2.intraId === player.intraId)
				this.sendMsgToPlayer(this.player1.clientSocket, 'askForRematch', `${player.nameNick} proposed a rematch`);
		}
	}

	acceptRematch(player: GameTypes.PlayingPlayer): GameDataDTO | null {
		
		const gameData: GameDataDTO = {
			sessionToken: uuidv4(),
			mode: this.mode,
			difficulty: this.difficulty,
			extras: this.powerUpSelected,
		};
		this.waitingForRematch = false;

		this.sendMsgToPlayer(this.player1.clientSocket, 'acceptRematch', gameData);
		if (this.mode === GameTypes.GameMode.multi) {
			this.sendMsgToPlayer(this.player2.clientSocket, 'acceptRematch', gameData);
			this.logger.log(`session [${this.sessionToken}] - ${player.nameNick} accepted the rematch`);
			return (gameData);
		}
		else {
			this.logger.log(`session [${this.sessionToken}] - ${player.nameNick} plays again against the computer`);
			return (null);
		}
	}

	abortRematch(player: GameTypes.PlayingPlayer): void {

		if (this.mode !== GameTypes.GameMode.multi)
			return ;

		this.waitingForRematch = false;
		this.logger.debug(`session [${this.sessionToken}] - player ${player.nameNick} rejected rematch`);
		
		if (this.player1.intraId === player.intraId)
			this.sendMsgToPlayer(this.player2.clientSocket, 'abortRematch', `${player.nameNick} rejected rematch`);
		else if (this.player2.intraId === player.intraId)
			this.sendMsgToPlayer(this.player1.clientSocket, 'abortRematch', `${player.nameNick} rejected rematch`);
		
		this.logger.debug(`session [${this.sessionToken}] - rematch phase ending`);
	}

	// Handle paddle movement based on key data
	movePaddle(player: GameTypes.PlayingPlayer, direction: GameTypes.PaddleDirection): void {
		
		if (this.engineRunning === false)
			return;
		
		const playerIndex: number = (this.player1.intraId === player.intraId) ? 0 : 1;
		this.addPowerUp(playerIndex);
		const delta =
			direction === GameTypes.PaddleDirection.up
				? this.paddleSpeed[playerIndex] * -1
				: this.paddleSpeed[playerIndex];
		if (this.player1.intraId === player.intraId)
			this.player1.posY = Math.max(
				this.paddleHeights[playerIndex] / 2,
				Math.min(this.windowHeight - this.paddleHeights[playerIndex] / 2, this.player1.posY + delta),
			);
		else if (this.player2.intraId === player.intraId)
			this.player2.posY = Math.max(
				this.paddleHeights[playerIndex] / 2,
				Math.min(this.windowHeight - this.paddleHeights[playerIndex] / 2, this.player2.posY + delta),
			);
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
		player_no: number,
		item_x: number,
		item_y: number,
	): number | null {
		let player_x: number = 0;
		let player_y: number = 0;
		if (player_no === 0) {
			player_x = this.player1.posX;
			player_y = this.player1.posY;
		} else if (player_no === 1) {
			player_x = this.player2.posX;
			player_y = this.player2.posY;
		}

		const checkHitX = Math.abs(player_x - item_x) < (this.paddleWidth / 2 + this.ballRadius);
		const checkHitY = Math.abs(player_y - item_y) < (this.paddleHeights[player_no] / 2 + this.ballRadius);

		if (checkHitX && checkHitY)
			return player_y - item_y; // Return offset
		else
			return null; // No collision
	}

	// Extras / Power Ups
	addSpeedBall(player_no: number): void {
		if (this.powerUpType === GameTypes.PowerUpType.speedBall) {
			this.ballSpeed =
				this.powerUpStatus[player_no] === true
					? this._defaultBallSpeed * 3
					: this._defaultBallSpeed;
		}
	}

	addPowerUp(player_no: number): void {
		if (this.powerUpType === GameTypes.PowerUpType.shrinkPaddle) {
			this.paddleHeights[player_no] =
				this.powerUpStatus[player_no] === true
					? this._defaultPaddleHeight / 2
					: this._defaultPaddleHeight;
		} else if (this.powerUpType === GameTypes.PowerUpType.stretchPaddle) {
			// powerUpType === "stretchPaddle"
			this.paddleHeights[player_no] =
				this.powerUpStatus[player_no] === true
					? this._defaultPaddleHeight * 2
					: this._defaultPaddleHeight;
		} else if (this.powerUpType === GameTypes.PowerUpType.speedPaddle) {
			this.paddleSpeed[player_no] =
				this.powerUpStatus[player_no] === true ? this._highPaddleSpeed : this._defaultpaddleSpeed;
		} else if (this.powerUpType === GameTypes.PowerUpType.slowPaddle) {
			this.paddleSpeed[player_no] =
				this.powerUpStatus[player_no] === true ? this._lowPaddleSpeed : this._defaultpaddleSpeed;
		}
	}

	startPowerUpTimer(): void {
		this.powerUpInterval = setInterval(() => {
			this.powerUpIntervalTime = Math.random() * (20000 - 10000) + 10000;
			this.spawnPowerUp();
		}, this.powerUpIntervalTime);
	}

	setRandomPowerUp(): void {
		const randomIndex = Math.floor(Math.random() * this.powerUpSelected.length); // Pick a random index
		this.powerUpType = this.powerUpSelected[randomIndex];
		this.logger.log(`session [${this.sessionToken}] - spawning power up ${GameTypes.PowerUpType[this.powerUpType]}`);
	}

	spawnPowerUp(): void {
		if (this.powerUpActive)
			return; // If speed ball is already active, do nothing

		this.setRandomPowerUp(); // Deactivate all, then turn on a random power up
		const spawnX = this.windowWidth / 2;
		const spawnY = Math.random() * (this.windowHeight - 50) + 25; // Random Y position within bounds
		const randomDirX = Math.random() < 0.5 ? -1 : 1;

		// if randomDirX == 1 towards player2, else towards player1
		this.powerUpPosition = { x: spawnX, y: spawnY, dx: randomDirX, dy: 0 };
		this.powerUpActive = true;
	}

	deactivatePowerUp(): void {
		this.powerUpActive = false;
		this.logger.debug(`session [${this.sessionToken}] - power up ${GameTypes.PowerUpType[this.powerUpType]} lost`);

		// Notify players that the speed ball has been deactivated
		if (this.player1) {
			this.sendMsgToPlayer(this.player1.clientSocket, 'powerUpDeactivated'); // yellow ball disappears
		}
		if (this.player2 && this.mode == GameTypes.GameMode.multi) {
			this.sendMsgToPlayer(this.player2.clientSocket, 'powerUpDeactivated');
		}
	}

	handlePowerUpCollisionWithPaddle(player_no: number): void {
		if (player_no === 0)
			this.logger.debug(`session [${this.sessionToken}] - ${this.player1.nameNick} caught power up ${GameTypes.PowerUpType[this.powerUpType]}`);
		else
			this.logger.debug(`session [${this.sessionToken}] - ${this.player2.nameNick} caught power up ${GameTypes.PowerUpType[this.powerUpType]}`);
		// Give 'shrinkPaddle' power down to opponent
		if (
			this.powerUpType === GameTypes.PowerUpType.shrinkPaddle ||
			this.powerUpType === GameTypes.PowerUpType.slowPaddle
		) {
			player_no = player_no === 0 ? 1 : 0;
		}
		this.powerUpStatus[player_no] = true;

		const playerIdentity1 =
			player_no === 0 ? GameTypes.PlayerIdentity.self : GameTypes.PlayerIdentity.opponent;
		this.sendPowerUpData(this.player1, playerIdentity1, true);
		if (this.mode === GameTypes.GameMode.multi) {
			const playerIdentity2 =
				player_no === 1 ? GameTypes.PlayerIdentity.self : GameTypes.PlayerIdentity.opponent;
			this.sendPowerUpData(this.player2, playerIdentity2, true);
		}
		// Set a timer to remove the power-up after the duration
		setTimeout(() => {
			if (this.engineRunning) this.removePowerUp(player_no);
		}, this.powerUpDuration);

		// Deactivate the power up after collision
		this.deactivatePowerUp();
	}

	removePowerUp(player_no: number): void {
		// Remove the power-up status
		this.powerUpStatus[player_no] = false;
		const playerIdentity1 =
			player_no === 0 ? GameTypes.PlayerIdentity.self : GameTypes.PlayerIdentity.opponent;
		this.sendPowerUpData(this.player1, playerIdentity1, false);
		if (this.mode === GameTypes.GameMode.multi) {
			const playerIdentity2 =
				player_no === 1 ? GameTypes.PlayerIdentity.self : GameTypes.PlayerIdentity.opponent;
			this.sendPowerUpData(this.player2, playerIdentity2, false);
		}
	}

	sendPowerUpData(
		playerBonus: GameTypes.PlayingPlayer,
		player_id: number,
		active: boolean,
	): void {
		const powerUpStatus = {
			active: active,
			player: player_id,
			type: this.powerUpType,
		};
		this.sendMsgToPlayer(playerBonus.clientSocket, 'powerUpActivated', powerUpStatus); // Color turns back to original paddle colour
	}

	sendMsgToPlayer(client: Socket, msg: string, data?: any): void {
		if (this.hardDebugMode == true)
			this.logger.debug(
				`session [${this.sessionToken}] - emitting to client ${client.handshake.address} data: ${JSON.stringify(data)}`,
			);

		client.emit(msg, data);
	}

	getPlayerFromClient(client: Socket): GameTypes.PlayingPlayer {

		if (this.player1 && this.player1.clientSocket.id === client.id)
			return this.player1;
		else if (this.player2 && this.player2.clientSocket.id === client.id)
			return this.player2;
		else
			this.thrower.throwGameExcp(
				`client [id ${client.id}] does not belong to the game session`,
				this.sessionToken,
				`${SimulationService.name}.getPlayerFromClient()`
			);
	}
}
