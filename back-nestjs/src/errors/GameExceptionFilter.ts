import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
	HttpStatus,
	NotFoundException,
} from '@nestjs/common';

import GameException from './GameException';
import { RoomManagerService } from 'src/game/game.roomManager.service';

// @Catch() // Cattura tutte le eccezioni
@Catch(GameException)
export default class GameExceptionFilter implements ExceptionFilter {
	constructor(private roomManager: RoomManagerService) {}

	catch(exception: any, host: ArgumentsHost) {
		const ctx = host.switchToWs();
		const client = ctx.getClient();
		const data = ctx.getData();

		try {
			
			this.roomManager.dropRoom(data.sessionToken, exception.message)
		}
		catch {

			client.emit('gameError', `Internal error: ${exception.message}`);
			client.disconnect(true);
		}
	}
};
