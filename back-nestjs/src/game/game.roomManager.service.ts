import { Injectable } from '@nestjs/common';

import SimulationService from './game.simulation.service';
import { GameMode, PaddleDirection } from './game.types';
import { Server, Socket } from 'socket.io';
import AppLoggerService from 'src/log/log.service';


@Injectable()
export class RoomManagerService {
	private rooms: Map<string, SimulationService> = new Map();

	constructor(private logger: AppLoggerService) {

    	this.logger.setContext(RoomManagerService.name);
	};

	createRoom(sessionToken: string, mode: GameMode, extras: boolean): void {
		if (this.rooms.has(sessionToken)) { // Should happen once when the second player is joining the room
			console.log(`Room with ID ${sessionToken} already exists. Player 2 joining.`);
		}
		else {
			this.logger.log(`Creating room with sessionToken: ${sessionToken}`);
			this.rooms.set(sessionToken, new SimulationService()); // create a new session (as instance of a service) in the rooms array 
		}
		const room = this.rooms.get(sessionToken);
		room.setInitData(sessionToken, mode, extras) // set init data in the game service
		if (room.isWaiting() === false) // do the game init stuff here
			room.startWaiting();
	}

	addPlayer(sessionToken: string, client: Socket, playerId: number, nameNick: string): void {
		const room = this.rooms.get(sessionToken);
		if (!room) {
			console.log(`Error adding player to room, room with sessionToken ${sessionToken} not found`);
			return ;
		}
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
		if (simulationService) {
			simulationService.movePaddle(clientId, data)
		}
	}
}
