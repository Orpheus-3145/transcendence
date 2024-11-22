import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';


@Injectable()
export default class MatchmakingService {
  
	private _waitingPlayersIP: Array<Socket> = new Array();
  private _checker = null;

	addPlayerToQueue(clientSocket: Socket): void {

		this._waitingPlayersIP.push(clientSocket);

		if (this._checker === null)
			this._checker = setInterval(() => this.checkNewGame(), 1000);

		console.log(`client ${clientSocket.handshake.address} joined queue`);
	};

	removePlayerFromQueue(...players: Socket[]) {

		const tmpWaitingPlayers: Socket[] = [];

		while (this._waitingPlayersIP.length > 0) {

			const currentPlayer: Socket = this._waitingPlayersIP.shift();
			if (players.includes(currentPlayer))
				console.log(`player ${currentPlayer.handshake.address} left queue `);
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
			
			const player1: Socket = this._waitingPlayersIP[index++];
			const player2: Socket = this._waitingPlayersIP[index++];
			const sessionToken: string = uuidv4();

			player1.emit('ready', sessionToken);  // message player1
			player2.emit('ready', sessionToken);  // message player2
		}
	};
};