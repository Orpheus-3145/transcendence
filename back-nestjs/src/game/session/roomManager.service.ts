import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';

import SimulationService from './simulation.service';
import AppLoggerService from 'src/log/log.service';
import ExceptionFactory from 'src/errors/exceptionFactory.service';
import GameDataDTO from 'src/dto/gameData.dto';
import PaddleDirectionDTO from 'src/dto/paddleDirection.dto';
import PlayerDataDTO from 'src/dto/playerData.dto';
import { PlayingPlayer } from 'src/game/types/game.interfaces';

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

		this.rooms.set(data.sessionToken, this.gameRoomFactory(data));
	}

	handleDisconnect(client: Socket): void {
		for (const [sessionToken, simulationService] of this.rooms.entries()) {
			try {
				const player: PlayingPlayer = simulationService.getPlayerFromClient(client);
				simulationService.handleDisconnect(player);
				this.deleteRoom(sessionToken);
				break;
			}
			catch (GameException) {	// client doesn't belong to the room, check the others
				continue ;
			}
		}
	}

	addPlayer(data: PlayerDataDTO, client: Socket): void {

		const gameRoom = this.getRoom(data.sessionToken);
		gameRoom.addPlayer(data, client);
	}

	movePaddle(data: PaddleDirectionDTO, client: Socket) {
		
		const gameRoom = this.getRoom(data.sessionToken);
		const player: PlayingPlayer = gameRoom.getPlayerFromClient(client);

		gameRoom.movePaddle(player, data.direction);

		this.logger.debug(
			`session [${data.sessionToken}] - update from ${player.nameNick}, move '${data.direction}'`,
		);
	}

	askForRematch(sessionToken: string, client: Socket): void {

		const gameRoom: SimulationService = this.getRoom(sessionToken);
		const player: PlayingPlayer = gameRoom.getPlayerFromClient(client);

		gameRoom.askForRematch(player);
	}

	acceptRematch(sessionToken: string, client: Socket): void {

		const gameRoom: SimulationService = this.getRoom(sessionToken);
		const player: PlayingPlayer = gameRoom.getPlayerFromClient(client);

		const gameData = gameRoom.acceptRematch(player);
		// SimulationService.acceptRematch() returns the gameData (if the rematch is multiplayer)
		// to RoomManagerService can create the new room directly
		if (gameData)
			this.createRoom(gameData);
	}

	abortRematch(sessionToken: string, client: Socket): void {

		const gameRoom: SimulationService = this.getRoom(sessionToken);
		const player: PlayingPlayer = gameRoom.getPlayerFromClient(client);

		gameRoom.abortRematch(player);
	}

	dropRoomCauseError(sessionToken: string, trace: string): void {

		this.getRoom(sessionToken).interruptGame(trace);
		this.deleteRoom(sessionToken);
	}

	getRoom(sessionToken: string): SimulationService {
		const room = this.rooms.get(sessionToken);
		if (!room)
			this.thrower.throwGameExcp(
				`room [session: ${sessionToken}] not found`,
				sessionToken,
				`${RoomManagerService.name}.${this.constructor.prototype.getRoom.name}()`,
			);

		return room;
	}

	deleteRoom(sessionToken: string): void {

		if (this.rooms.delete(sessionToken) === true)
			this.logger.log(`session [${sessionToken}] - room deleted`);
	}
}
