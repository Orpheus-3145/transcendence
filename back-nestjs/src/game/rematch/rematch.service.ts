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
		else
			this.player2 = waitingPlayer;
		this.logger.debug(`client ${client.id} room for rematch`);
	}

	playAgain(client: Socket): void {

		if (this._lastGamedata.mode === GameMode.single)
			this.startGame()
		else if (this._lastGamedata.mode === GameMode.multi) {
			
			if (client.id === this.player1.clientSocket.id) 
				this.player2.clientSocket.emit('readyDoubleGame');
			else if (client.id === this.player2.clientSocket.id) 
				this.player1.clientSocket.emit('readyDoubleGame');
		}
	}

	startGame(): void {
		
		if (this._lastGamedata.mode === GameMode.single) {
			if (this.player1 === null)
				return ;
		
			this._lastGamedata.sessionToken = uuidv4();
		
			this.player1.clientSocket.emit('readySingleGame');
			this.logger.log(
				`rematch started - sessionToken: ${this._lastGamedata.sessionToken}`,
			);
			this.roomManager.createRoom(this._lastGamedata);

		} else if (this._lastGamedata.mode === GameMode.multi) {
			if ((this.player1 === null) || (this.player2 === null))
				return ;

			this._lastGamedata.sessionToken = uuidv4();
			this.player1.clientSocket.emit('readyDoubleGame', this._lastGamedata);
			this.player2.clientSocket.emit('readyDoubleGame', this._lastGamedata);

			this.logger.log(
				`rematch started - sessionToken: ${this._lastGamedata.sessionToken}`,
			);
			this.roomManager.createRoom(this._lastGamedata);
		}
	}
}
