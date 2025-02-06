import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';

import SimulationService from './simulation.service';
import { GameMode, PaddleDirection, PlayingPlayer } from 'src/game/game.types';
import AppLoggerService from 'src/log/log.service';
import ExceptionFactory from 'src/errors/exceptionFactory.service';
import GameDataDTO from 'src/dto/gameData.dto';

@Injectable()
export default class RoomManagerService {
	private rooms: Map<string, SimulationService> = new Map();

	constructor(
		private readonly config: ConfigService,
		private readonly logger: AppLoggerService,
		@Inject(forwardRef(() => ExceptionFactory)) private readonly thrower: ExceptionFactory,
		@Inject('GAME_SPAWN')
		private readonly gameRoomFactory: (data: GameDataDTO) => SimulationService,
	) {
		this.logger.setContext(RoomManagerService.name);
		if (this.config.get<boolean>('DEBUG_MODE_GAME', false) == false)
			this.logger.setLogLevels(['log', 'warn', 'error', 'fatal']);
	}

	createRoom(data: GameDataDTO): void {
		this.logger.log(`session [${data.sessionToken}] - creating new room`);

		this.rooms.set(data.sessionToken, this.gameRoomFactory(data));
	}

	dropRoomCauseError(sessionToken: string, trace: string): void {
 		this.logger.error(`session [${sessionToken}] - removing room`);

		this.getRoom(sessionToken).interruptGame(trace);
		this.deleteRoom(sessionToken);
	}

	addPlayer(sessionToken: string, client: Socket, playerId: number, nameNick: string): void {
		this.logger.log(
			`session [${sessionToken}] - player ${nameNick} [id ${client.id}] joined the room`,
		);

		this.getRoom(sessionToken).addPlayer(client, playerId, nameNick);
	}

	handleDisconnect(client: Socket): void {
		for (const [sessionToken, simulationService] of this.rooms.entries()) {
			if (simulationService.clientIsPlayer(client.id)) {
				simulationService.handleDisconnect(client);
				this.deleteRoom(sessionToken); // Cleanup room

				break;
			}
		}
	}

	movePaddle(sessionToken: string, clientId: string, data: PaddleDirection) {
		const room = this.getRoom(sessionToken);
		const playerId = this.getPlayerId(room, clientId);
		room.movePaddle(clientId, data, playerId);

		this.logger.debug(
			`session [${sessionToken}] - update from client ${clientId} , move '${data}'`,
		);
	}

	getRoom(sessionToken: string): SimulationService {
		const room = this.rooms.get(sessionToken);
		if (!room)
			this.thrower.throwGameExcp(
				'room not found',
				sessionToken,
				`${RoomManagerService.name}.${this.constructor.prototype._getRoom.name}()`,
			);

		return room;
	}

	getPlayerId(room: SimulationService, clientId: string): number {

		return room.getPlayerId(clientId);
	}

	deleteRoom(sessionToken: string): void {

		this.rooms.delete(sessionToken);
	}

	askForRematch(sessionToken: string, client: Socket): void {

		const gameRoom: SimulationService = this.getRoom(sessionToken);
		const player: PlayingPlayer = gameRoom.getPlayerFromClient(client);

		if (player === null) {}
			// do something
		gameRoom.askForRematch(player);
	}

	acceptRematch(sessionToken: string, client: Socket): void {

		const gameRoom: SimulationService = this.getRoom(sessionToken);
		const player: PlayingPlayer = gameRoom.getPlayerFromClient(client);

		if (player === null) {}
			// do something
		
		const gameData = this.getRoom(sessionToken).acceptRematch();
		// SimulationService.acceptRematch() returns the gameData if the rematch is multiplayer
		// to create the new room for the simulation
		if (gameData)
			this.createRoom(gameData);
	}

	abortRematch(sessionToken: string, client: Socket): void {

		const gameRoom: SimulationService = this.getRoom(sessionToken);
		const player: PlayingPlayer = gameRoom.getPlayerFromClient(client);

		if (player === null) {}
			// do something

		gameRoom.abortRematch(player);
	}
}
