import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';

import SimulationService from './simulation.service';
import { PaddleDirection } from '../game.types';
import AppLoggerService from 'src/log/log.service';
import ExceptionFactory from 'src/errors/exceptionFactory.service';
import GameInitDTO from 'src/dto/gameInit.dto';

@Injectable()
export default class RoomManagerService {
	private rooms: Map<string, SimulationService> = new Map();

	constructor(
		private readonly config: ConfigService,
		private readonly logger: AppLoggerService,
		@Inject(forwardRef(() => ExceptionFactory)) private readonly thrower: ExceptionFactory,
		@Inject('GAME_SPAWN')
		private readonly gameRoomFactory: (data: GameInitDTO) => SimulationService,
	) {
		this.logger.setContext(RoomManagerService.name);
		// do not log all the emits to clients if not really necessary
		if (this.config.get<boolean>('DEBUG_MODE_GAME', false) == false)
			this.logger.setLogLevels(['log', 'warn', 'error', 'fatal']);
	}

	createRoom(data: GameInitDTO): void {
		this.rooms.set(data.sessionToken, this.gameRoomFactory(data));

		this.logger.log(`session [${data.sessionToken}] - creating new room, mode: ${data.mode}`);
	}

	dropRoom(sessionToken: string, trace: string): void {
		this._getRoom(sessionToken).interruptGame(trace);
		this._deleteRoom(sessionToken);

		this.logger.log(`session [${sessionToken}] - removing room, trace: ${trace}`);
	}

	addPlayer(sessionToken: string, client: Socket, playerId: number, nameNick: string): void {
		this._getRoom(sessionToken).addPlayer(client, playerId, nameNick);
		this.logger.log(`session [${sessionToken}] - player ${nameNick} [id client ${client.id}] added to game`);
	}

	handleDisconnect(client: Socket): void {
		for (const [sessionToken, simulationService] of this.rooms.entries()) {
			if (simulationService.checkClientId(client.id)) {
				simulationService.handleDisconnect(client);
				this._deleteRoom(sessionToken); // Cleanup room

				break;
			}
		}
	}

	movePaddle(sessionToken: string, clientId: string, data: PaddleDirection) {
		this._getRoom(sessionToken).movePaddle(clientId, data);

		this.logger.debug(
			`session [${sessionToken}] - update from client ${clientId} , move '${data}'`,
		);
	}

	_getRoom(sessionToken: string): SimulationService {
		const room = this.rooms.get(sessionToken);
		if (!room)
			this.thrower.throwGameExcp(
				'room not found',
				sessionToken,
				`${RoomManagerService.name}.${this.constructor.prototype._getRoom.name}()`,
			);

		return room;
	}

	_deleteRoom(sessionToken: string): void {
		this.rooms.delete(sessionToken);
	}
}
