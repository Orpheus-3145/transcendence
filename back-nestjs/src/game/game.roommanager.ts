import SimulationService from './game.simulation.service';
import { GameMode, PaddleDirection } from './game.types';
import { Server, Socket } from 'socket.io';

export class RoomManager {
	// data_races with the room manager? 
	private rooms: Map<string, SimulationService> = new Map();

	createRoom(sessionToken: string, mode: GameMode): void {
		if (this.rooms.has(sessionToken)) { // This should never happen
			console.log(`Room with ID ${sessionToken} already exists.`);
		}
		else {
			this.rooms.set(sessionToken, new SimulationService()); // create a new session (as instance of a service) in the rooms array 
		}
		const room = this.rooms.get(sessionToken);
		room.setInitData(sessionToken, mode) // set init data in the game service
		if (room.isWaiting() === false) // do the game init stuff here
			room.startWaiting();
	}

	getRoom(sessionToken: string): SimulationService | undefined {
		const room = this.rooms.get(sessionToken);
		if (!room) {
			console.error(`No room found for sessionToken: ${sessionToken}`);
			return undefined;
		}
		return room;
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
	}

	movePaddle(sessionToken: string, clientId: string, data: PaddleDirection,) {
		const simulationService = this.rooms.get(sessionToken);
		if (simulationService) {
			simulationService.movePaddle(clientId, data)
		}
	}
}
