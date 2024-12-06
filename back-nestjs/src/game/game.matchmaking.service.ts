import { Scope, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

import { UserDTO } from '../dto/user.dto';
import AppLoggerService from 'src/log/log.service';

export interface Player {
	clientSocket: Socket;
	intraId: number;
	nameNick: string;
}

@Injectable({ scope: Scope.TRANSIENT })
export default class MatchmakingService {
	private _waitingPlayersIP: Array<Player> = new Array();
	private _checker = null;

	constructor(private logger: AppLoggerService) {

    this.logger.setContext(MatchmakingService.name);
	};

	addPlayerToQueue(clientSocket: Socket, intra42data: UserDTO): void {
		const newPlayer: Player = {
			clientSocket: clientSocket,
			intraId: intra42data.id,
			nameNick: intra42data.nameNick,
		};

		this._waitingPlayersIP.push(newPlayer);

		if (this._checker === null)
			this._checker = setInterval(() => this.checkNewGame(), 1000);

		this.logger.log(`player ${newPlayer.nameNick} [${newPlayer.clientSocket.handshake.address}] joined queue`);
	};

	removePlayerFromQueue(leaver: Socket) {

		const tmpPlayers: Array<Player> = [];

		while (this._waitingPlayersIP.length > 0) {
			const currentPlayer: Player = this._waitingPlayersIP.shift();
			if (leaver.id === currentPlayer.clientSocket.id)
				this.logger.log(`player ${currentPlayer.nameNick} [${currentPlayer.clientSocket.handshake.address}] left queue`);
			else 
				tmpPlayers.unshift(currentPlayer);
		}
		this._waitingPlayersIP = tmpPlayers;

		if (this._waitingPlayersIP.length === 0) {
			clearInterval(this._checker);
			this._checker = null;
		}
	};

	checkNewGame(): void {

		while (this._waitingPlayersIP.length > 1)
			this.startNewGame(this._waitingPlayersIP.shift(), this._waitingPlayersIP.shift());
	};

	startNewGame(p1: Player, p2: Player): void {
		
		const sessionToken: string = uuidv4();

		p1.clientSocket.emit('ready', sessionToken);
		p2.clientSocket.emit('ready', sessionToken);

		this.logger.log(`starting new multiplayer match between ${p1.nameNick} and ${p2.nameNick}`);
	};
}
