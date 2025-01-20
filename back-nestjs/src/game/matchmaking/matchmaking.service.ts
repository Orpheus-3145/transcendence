import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

import AppLoggerService from 'src/log/log.service';
import { GameDifficulty, GameMode } from '../game.types';
import RoomManagerService from '../session/roomManager.service';
import ExceptionFactory from 'src/errors/exceptionFactory.service';
import { WaitingPlayer } from '../game.types';
import GameInitDTO from 'src/dto/gameInit.dto';

@Injectable()
export default class MatchmakingService {
	private _waitingPlayersIP: Array<WaitingPlayer> = new Array();
	private _checker = null;

	constructor(
		private logger: AppLoggerService,
		private roomManager: RoomManagerService,
		@Inject(forwardRef(() => ExceptionFactory)) private readonly thrower: ExceptionFactory,
	) {
		this.logger.setContext(MatchmakingService.name);
	}

	addPlayerToQueue(client: Socket, info: GameInitDTO): void {
		const waitingPlayer: WaitingPlayer = {
			clientSocket: client,
			extras: info.extras,
		};
		this._waitingPlayersIP.push(waitingPlayer);

		if (this._checker === null) this._checker = setInterval(() => this.checkNewGame(), 100);

		this.logger.debug(`client ${client.handshake.address} joined the queue`);
	}

	removePlayerFromQueue(leaver: Socket) {
		const tmpWaitingPlayers: WaitingPlayer[] = [];

		while (this._waitingPlayersIP.length > 0) {
			const currentPlayer: WaitingPlayer = this._waitingPlayersIP.pop();

			if (leaver.id == currentPlayer.clientSocket.id)
				this.logger.debug(`client ${currentPlayer.clientSocket.id} left the queue`);
			else tmpWaitingPlayers.push(currentPlayer);
		}
		this._waitingPlayersIP = tmpWaitingPlayers;

		if (this._waitingPlayersIP.length === 0) {
			clearInterval(this._checker);
			this._checker = null;
		}
	}

	checkNewGame(): void {
		if (this._waitingPlayersIP.length < 2) return;


		for (let i = 0; i < this._waitingPlayersIP.length - 1; i++) {
			const player1: WaitingPlayer = this._waitingPlayersIP[i];

			for (let j = i+1; j < this._waitingPlayersIP.length; j++) {

				const player2: WaitingPlayer = this._waitingPlayersIP[j];

				if (this.doTheyMatch(player1, player2)) {

					const initData: GameInitDTO = {
						sessionToken: uuidv4(),
						mode: GameMode.multi,
						difficulty: GameDifficulty.unset,
						extras: player1.extras,
					};
	
					player1.clientSocket.emit('ready', initData.sessionToken); // message player1
					player2.clientSocket.emit('ready', initData.sessionToken); // message player2
	
					this.logger.log(
						`found players ${player1.clientSocket.id}, ${player2.clientSocket.id} - sessionToken: ${initData.sessionToken}`,
					);
					this.roomManager.createRoom(initData);
					return ;
				}
			}
		}
	}

	doTheyMatch(player1: WaitingPlayer, player2: WaitingPlayer) {

		return (player1.extras.speedball === player2.extras.speedball &&
						player1.extras.powerup_2 === player2.extras.powerup_2 && 
						player1.extras.powerup_3 === player2.extras.powerup_3 &&
						player1.extras.powerup_4 === player2.extras.powerup_4);
	}

	isPlayerWaiting(client: WaitingPlayer) {
		return this._waitingPlayersIP.includes(client);
	}
}
