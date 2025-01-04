import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

import SimulationService from './game.simulation.service';
import { GameMode, PaddleDirection } from './game.types';
import AppLoggerService from 'src/log/log.service';
import SimulationException from '../errors/SimulationException';


@Injectable()
export class RoomManagerService {
	private rooms: Map<string, SimulationService> = new Map();

	constructor(private logger: AppLoggerService) {

    	this.logger.setContext(RoomManagerService.name);
	};

	createRoom(sessionToken: string, mode: GameMode): void {

		if (this.rooms.has(sessionToken))
			return;
			// throw new SimulationException(`Internal - room with ID ${sessionToken} already exists`)

		this.logger.log(`creating room with sessionToken: ${sessionToken}`);
		this.rooms.set(sessionToken, new SimulationService(mode)); // create a new session (as instance of a service) in the rooms array 

		// const room = this.rooms.get(sessionToken);
		// room.setInitData(sessionToken, mode) // set init data in the game service
		// if (room.isWaiting() === false) // do the game init stuff here
		// 	room.startWaiting();
	}

	// addNewRoom(sessionToken: string, mode: GameMode): void {

	// 	if (this.rooms.has(sessionToken))
	// 		throw new SimulationException(`Internal - room with ID ${sessionToken} already exists`)

	// 	this.logger.log(`creating room with ID ${sessionToken}`);
	// 	this.rooms.set(sessionToken, new SimulationService(mode)); // create a new session (as instance of a service) in the rooms array 

	// 	// const room = this.rooms.get(sessionToken);
	// 	// // room.setInitData(sessionToken, mode) // set init data in the game service
	// 	// room.setMode(mode)
	// 	// if (room.isWaiting() === false) // do the game init stuff here
	// 	// 	room.startWaiting();
	// }

	addPlayer(sessionToken: string, client: Socket, playerId: number, nameNick: string): void {
		const room = this.rooms.get(sessionToken);
		if (!room)
			throw new SimulationException(`Internal - error adding player to room, with sessionToken ${sessionToken} not found`)
		
		room.addPlayer(client, playerId, nameNick);
	}

	// When someone disconnets from the socket
	handleDisconnect(client: Socket): void {
		for (const [sessionToken, simulationService] of this.rooms.entries()) {
			if (simulationService.checkClientId(client.id)) {
				simulationService.handleDisconnect(client);
				this.rooms.delete(sessionToken); // Cleanup room
				break;
			}
		}
		this.logger.log(`Received message that player left`);
	}

	movePaddle(sessionToken: string, clientId: string, data: PaddleDirection,) {
		const simulationService = this.rooms.get(sessionToken);

		if (simulationService)
			simulationService.movePaddle(clientId, data)
	}
}
