import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

import SimulationService from './game.simulation.service';
import { GameMode, PaddleDirection } from './game.types';
import AppLoggerService from 'src/log/log.service';
import GameException from '../errors/GameException';


@Injectable()
export class RoomManagerService {

	private rooms: Map<string, SimulationService> = new Map();

	constructor(public logger: AppLoggerService) {

    	this.logger.setContext(RoomManagerService.name);
			this.logger.setLogLevels(['log', 'warn', 'error', 'fatal'])
	};

	createRoom(sessionToken: string, mode: GameMode): void {

		this._setRoom(sessionToken, mode);
		
		this.logger.log(`creating room with sessionToken: ${sessionToken} mode: ${mode}`);
	}

	dropRoom(sessionToken: string, trace: string): void {

		this._getRoom(sessionToken).interruptGame(trace);
		this._deleteRoom(sessionToken);

		this.logger.log(`session [${sessionToken}] - removing room, trace: ${trace}`);
	}

	addPlayer(sessionToken: string, client: Socket, playerId: number, nameNick: string): void {
		
		this._getRoom(sessionToken).addPlayer(client, playerId, nameNick);
		
		this.logger.debug(`session [${sessionToken}] - player ${nameNick} [id client ${client.id}] added to game`);
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

	movePaddle(sessionToken: string, clientId: string, data: PaddleDirection,) {

		this._getRoom(sessionToken).movePaddle(clientId, data)
		this.logger.debug(`session [${sessionToken}] - update from client ${clientId} , move '${data}'`);
	}

	_getRoom(sessionToken: string): SimulationService {
		
		const room = this.rooms.get(sessionToken);
		if (!room)
			throw new GameException(`Internal - room with ID ${sessionToken} not found`)

		return (room);
	}

	_setRoom(sessionToken: string, mode: GameMode, notOverWrite = true): void {

		if (notOverWrite && this.rooms.get(sessionToken))
			throw new GameException(`Internal - room with ID ${sessionToken} already exists`)
		
		// create a new session (as instance of a service) in the rooms array 
		this.rooms.set(sessionToken, new SimulationService(sessionToken, mode, this.logger));
	}

	_deleteRoom(sessionToken: string): void {

		this.rooms.delete(sessionToken);
	}
}
