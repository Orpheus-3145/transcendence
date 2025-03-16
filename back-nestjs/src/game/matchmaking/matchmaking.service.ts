import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

import AppLoggerService from 'src/log/log.service';
import { fromMaskToArray, GameDifficulty, GameMode } from 'src/game/types/game.enum';
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

		const powerUpsList: string = fromMaskToArray(info.extras).join(', ');
		this.logger.debug(`client ${client.id} joined the queue for matchmaking, power ups: [${powerUpsList}]`);
	}

	removePlayerFromQueue(client: Socket): void {

		this._waitingPlayers = this._waitingPlayers.filter((player) => player.clientSocket.id !== client.id);
		this.logger.debug(`client ${client.id} left the queue for matchmaking`);
	}

	_checkNewGame(): void {
		for (let i = 0; i < this._waitingPlayers.length - 1; i++) {
			for (let j = i + 1; j < this._waitingPlayers.length; j++) {
				
				if ( this._waitingPlayers[i].extras !== this._waitingPlayers[j].extras )
					continue ;
				
				// found a match, a new game can start
				this.startNewGame(this._waitingPlayers[i], this._waitingPlayers[j]);
				
				// removing players from queue
				this._waitingPlayers.splice(i, 1);
				this._waitingPlayers.splice(j - 1, 1);
				if (this._waitingPlayers.length === 0) {
					clearInterval(this._checker);
					this._checker = null;
				}

				return;
			}
		}
	}

	startNewGame(player1: WaitingPlayer, player2: WaitingPlayer): void {
	
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
	}
}
