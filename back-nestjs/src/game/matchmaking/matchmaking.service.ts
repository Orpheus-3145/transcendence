import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

import AppLoggerService from 'src/log/log.service';
import { GameDifficulty, GameMode, PowerUpType } from 'src/game/types/game.enum';
import RoomManagerService from 'src/game/session/roomManager.service';
import ExceptionFactory from 'src/errors/exceptionFactory.service';
import { WaitingPlayer } from 'src/game/types/game.interfaces';
import GameDataDTO from 'src/dto/gameData.dto';

@Injectable()
export default class MatchmakingService {
	private _waitingPlayers: Array<WaitingPlayer> = new Array();
	private _checker: NodeJS.Timeout = null;

	constructor(
		private logger: AppLoggerService,
		private roomManager: RoomManagerService,
		@Inject(forwardRef(() => ExceptionFactory)) private readonly thrower: ExceptionFactory,
	) {
		this.logger.setContext(MatchmakingService.name);
	}

	addPlayerToQueue(client: Socket, info: GameDataDTO): void {
		const waitingPlayer: WaitingPlayer = {
			clientSocket: client,
			extras: info.extras,
		};
		this._waitingPlayers.push(waitingPlayer);

		if (this._checker === null)
			this._checker = setInterval(() => this._checkNewGame(), 100);

		this.logger.debug(`client ${client.id} joined the queue for matchmaking, power ups: [${info.extras.join(', ')}]`);
	}

	_checkNewGame(): void {
		if (this._waitingPlayers.length < 2)
			return;

		for (let i = 0; i < this._waitingPlayers.length - 1; i++) {
			const player1: WaitingPlayer = this._waitingPlayers[i];

			for (let j = i + 1; j < this._waitingPlayers.length; j++) {
				const player2: WaitingPlayer = this._waitingPlayers[j];

				if (!this._doTheyMatch(player1, player2))
					continue ;
				// found a match, a new game can start
				// removing players from queue
				this._waitingPlayers.splice(i, 1);
				this._waitingPlayers.splice(j - 1, 1);
				if (this._waitingPlayers.length === 0) {
					clearInterval(this._checker);
					this._checker = null;
				}
				// emitting players, creating game room
				const initData: GameDataDTO = {
					sessionToken: uuidv4(),
					mode: GameMode.multi,
					difficulty: GameDifficulty.unset,
					extras: player1.extras,
				};
				player1.clientSocket.emit('ready', initData.sessionToken);
				player2.clientSocket.emit('ready', initData.sessionToken);
				player1.clientSocket.disconnect();
				player2.clientSocket.disconnect();

				this.logger.log(`session [${initData.sessionToken}] - creating new room for multiplayer game`);
				this.roomManager.createRoom(initData);
				return;
			}
		}
	}

	_doTheyMatch(player1: WaitingPlayer, player2: WaitingPlayer) {
		return player1.extras.sort().toString() === player2.extras.sort().toString();
	}
}
