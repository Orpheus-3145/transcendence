import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

import AppLoggerService from 'src/log/log.service';
import { GameMode } from '../game.types';
import RoomManagerService from '../session/roomManager.service';
import ExceptionFactory from 'src/errors/exceptionFactory.service';
import { WaitingPlayer } from '../game.types';

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

	addPlayerToQueue(client: Socket, extras: boolean): void {
		const waitingPlayer: WaitingPlayer = {
			clientSocket: client,
			extras: extras,
		};
		// console.log(`Checking waitingPlayer: ${waitingPlayer.extras}`);
		this._waitingPlayersIP.push(waitingPlayer);

		if (this._checker === null) this._checker = setInterval(() => this.checkNewGame(), 100);

		// this.logger.debug(`client ${client.handshake.address} joined the queue`);
		this.logger.debug(`client ${client.id} joined the queue`);
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

		// for (let i = 0; i < this._waitingPlayersIP.length - 1; i++) {
		// 	// console.log(`checking ${this._waitingPlayersIP}}`);
		// 	const p1: WaitingPlayer = this._waitingPlayersIP[i];
		// 	const p2: WaitingPlayer = this._waitingPlayersIP[i + 1];

		// 	if (this.doTheyMatch(p1, p2)) {
		// 		// if player1 and player 2 share the same settings (i.e. extras, ...) then they can be coupled
		// 		const player1: WaitingPlayer = this._waitingPlayersIP.shift();
		// 		const player2: WaitingPlayer = this._waitingPlayersIP.shift();
		// 		const sessionToken: string = uuidv4();

		// 		player1.clientSocket.emit('ready', sessionToken); // message player1
		// 		player2.clientSocket.emit('ready', sessionToken); // message player2

		// 		this.logger.log(
		// 			`found players ${player1.clientSocket.id}, ${player2.clientSocket.id} - sessionToken: ${sessionToken}`,
		// 		);
		// 		this.roomManager.createRoom(sessionToken, player1.extras, GameMode.multi);
		// 		break;
		// 	}

		for (let i = 0; i < this._waitingPlayersIP.length - 1; i++) {
			// console.log(`checking ${this._waitingPlayersIP}}`);
			const player1: WaitingPlayer = this._waitingPlayersIP[i];

			for (let j = i+1; j < this._waitingPlayersIP.length; j++) {

				const player2: WaitingPlayer = this._waitingPlayersIP[j];

				if (this.doTheyMatch(player1, player2)) {

					const sessionToken: string = uuidv4();
	
					player1.clientSocket.emit('ready', sessionToken); // message player1
					player2.clientSocket.emit('ready', sessionToken); // message player2
	
					this.logger.log(
						`found players ${player1.clientSocket.id}, ${player2.clientSocket.id} - sessionToken: ${sessionToken}`,
					);
					this.roomManager.createRoom(sessionToken, player1.extras, GameMode.multi);
					return ;
				}
			}

			// if (this._waitingPlayersIP.length === 0) {
			// 	clearInterval(this._checker);
			// 	this._checker = null;
			// }
		}
	}

	doTheyMatch(player1: WaitingPlayer, player2: WaitingPlayer) {
		let match = false;
		match = player1.extras === player2.extras;

		return match;
	}

	isPlayerWaiting(client: WaitingPlayer) {
		return this._waitingPlayersIP.includes(client);
	}
}
