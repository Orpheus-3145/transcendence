import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import AppLoggerService from 'src/log/log.service';
import { RoomManagerService } from './game.roomManager.service';
import { GameMode } from './game.types';


@Injectable()
export default class MatchmakingService {
	private _waitingPlayersIP: Array<Socket> = new Array();
	private _checker = null;

	constructor(
		private logger: AppLoggerService,
		private roomManager: RoomManagerService,
	) {

		this.logger.setContext(MatchmakingService.name);
	};

	addPlayerToQueue(clientSocket: Socket): void {

		this._waitingPlayersIP.push(clientSocket);
		
		if (this._checker === null)
			this._checker = setInterval(() => this.checkNewGame(), 1000);

		this.logger.debug(`client ${clientSocket.handshake.address} joined the queue`);
	};

	removePlayerFromQueue(leaver: Socket) {

		if (!this._waitingPlayersIP.includes(leaver))
			return ;

		const tmpWaitingPlayers: Socket[] = [];

		while (this._waitingPlayersIP.length > 0) {

			const currentPlayer: Socket = this._waitingPlayersIP.shift();

			if (leaver.id == currentPlayer.id)
				this.logger.debug(`client ${currentPlayer.handshake.address} left the queue`);
			else
				tmpWaitingPlayers.unshift(currentPlayer);
		}
		this._waitingPlayersIP = tmpWaitingPlayers;
		
		clearInterval(this._checker);
		this._checker = null;
	};

	checkNewGame(): void {

		while (this._waitingPlayersIP.length > 1) {

			const player1: Socket = this._waitingPlayersIP.shift();
			const player2: Socket = this._waitingPlayersIP.shift();
			const sessionToken: string = uuidv4();

			player1.emit('ready', sessionToken);  // message player1
			player2.emit('ready', sessionToken);  // message player2

			this.logger.log(`found players ${player1.id}, ${player2.id} - sessionToken: ${sessionToken}`);
			this.roomManager.createRoom(sessionToken, GameMode.multi);
		}
		
		if (this._waitingPlayersIP.length === 0) {
			clearInterval(this._checker);
			this._checker = null;
		}
	};
}
