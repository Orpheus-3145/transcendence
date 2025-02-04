import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

import AppLoggerService from 'src/log/log.service';
import RoomManagerService from '../session/roomManager.service';
import ExceptionFactory from 'src/errors/exceptionFactory.service';
import { GameMode, WaitingPlayer } from '../game.types';
import GameInitDTO from 'src/dto/gameInit.dto';

@Injectable()
export default class RematchService {
	private player1: WaitingPlayer | null = null;
	private player2: WaitingPlayer | null = null;
	private _lastGamedata: GameInitDTO | null = null;
	private _checker: NodeJS.Timeout | null = null;

	constructor(
		private logger: AppLoggerService,
		private roomManager: RoomManagerService,
		@Inject(forwardRef(() => ExceptionFactory)) private readonly thrower: ExceptionFactory,
	) {
		this.logger.setContext(RematchService.name);
	}

	joinQueue(client: Socket, data: GameInitDTO): void {
		
		if (this._lastGamedata === null)
			this._lastGamedata = data;

		const waitingPlayer: WaitingPlayer = {
			clientSocket: client,
			extras: data.extras,
		};

		if (this.player1 === null)
			this.player1 = waitingPlayer;
		else if (this.player2 === null)
			this.player2 = waitingPlayer;

		this.logger.debug(`client ${client.id} joined room for rematch`);
	}

	askForRematch(client: Socket): void {

		// doesn't emit the clients directly, it wait for both of them to connect
		if (this._lastGamedata.mode === GameMode.multi)
			this._checker = setInterval(() => this.checkRematch(client), 100);
		// else it should throw an error!
	}

	checkRematch(client: Socket): void {

		if (! this.player1 || ! this.player2)
			return ;

		if (this.player1.clientSocket.id === client.id)
			this.player2.clientSocket.emit('rematchConfirm');
		else if (this.player2.clientSocket.id === client.id)
			this.player1.clientSocket.emit('rematchConfirm');

		clearInterval(this._checker);
		this._checker = null;
	}

	startGame(): void {

		this.logger.log(
			`rematch started - sessionToken: ${this._lastGamedata.sessionToken}`,
		);
		
		this._lastGamedata.sessionToken = uuidv4();
		
		this.player1.clientSocket.emit('acceptRematch', this._lastGamedata);
		if (this._lastGamedata.mode === GameMode.multi) {
			
			this.player2.clientSocket.emit('acceptRematch', this._lastGamedata);
			this.roomManager.createRoom(this._lastGamedata);
		}
	}

	abortRematch(client: Socket): void {

		if (this.player1 && this.player2 && this.player1.clientSocket.id === client.id)
			this.player2.clientSocket.emit('abortRematch', 'player refused rematch');
		else if (this.player1 && this.player2 && this.player2.clientSocket.id === client.id)
			this.player1.clientSocket.emit('abortRematch', 'player refused rematch');
	}

	leaveQueue(client: Socket): void {
		if (this.player1 && this.player1.clientSocket.id === client.id) {
			this.player1 = null;
			if (this.player2)
				this.player2.clientSocket.emit('abortRematch', 'player left queue');
		}
		else if (this.player2 && this.player2.clientSocket.id === client.id) {
			this.player2 = null;
			if (this.player1)
				this.player1.clientSocket.emit('abortRematch', 'player left queue');
		}
		this._lastGamedata = null;
	}
}
