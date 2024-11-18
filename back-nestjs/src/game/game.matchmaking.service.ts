import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

import { UserDTO } from '../dto/user.dto';
import Player from './player.interface';


@Injectable()
export default class MatchmakingService {
  
	private _waitingPlayersIP: Array<Player> = new Array();
  private _checker = null;

	addPlayerToQueue(clientSocket: Socket, intra42data: UserDTO): void {

		const newPlayer: Player = {
			clientSocket: clientSocket,
			intraId: intra42data.id,
			nameNick: intra42data.nameNick,
		};

		this._waitingPlayersIP.push(newPlayer);

		if (this._checker === null)
			this._checker = setInterval(() => this.checkNewGame(), 1000);

		console.log(`player ${newPlayer.nameNick} [${newPlayer.clientSocket.handshake.address}] joined queue`);
	};

	removePlayerFromQueue(...players: Socket[]) {

		const tmpWaitingPlayers: Player[] = [];

		while (this._waitingPlayersIP.length > 0) {

			const currentPlayer: Player = this._waitingPlayersIP.shift();
			if (players.includes(currentPlayer.clientSocket))
				console.log(`player ${currentPlayer.nameNick} left queue `);
			else
				tmpWaitingPlayers.unshift(currentPlayer);
		}

		if (this._waitingPlayersIP.length === 0) {

			clearInterval(this._checker);
			this._checker = null;
		}
	};

	checkNewGame(): void {

		var index = 0;
	
		while (index + 1 < this._waitingPlayersIP.length) {
			
			const player1: Player = this._waitingPlayersIP[index++];
			const player2: Player = this._waitingPlayersIP[index++];
			const sessionToken: string = uuidv4();

			player1.clientSocket.emit('ready', sessionToken);  // message player1
			player2.clientSocket.emit('ready', sessionToken);  // message player2
		}
	};
};