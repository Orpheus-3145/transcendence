import {
	Inject,
	forwardRef,
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
	HttpStatus,
} from '@nestjs/common';

import { GameException, SessionException, ChatException} from './exceptions';
import { RoomManagerService } from 'src/game/game.roomManager.service';
import AppLoggerService from 'src/log/log.service';

@Catch(GameException)
export class GameExceptionFilter implements ExceptionFilter {
	constructor(@Inject(forwardRef(() => RoomManagerService))
							private roomManager: RoomManagerService,
							@Inject(forwardRef(() => AppLoggerService))
							private logger: AppLoggerService) {

		this.logger.setContext(GameExceptionFilter.name);
	}

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
			this.logger.error(`session [${data.sessionToken}] - Exception, trace: ${exception.message} - client ${client.id} forced to disconnect`)
		}
	}
};

@Catch(SessionException)
export class SessionExceptionFilter implements ExceptionFilter {
	constructor(private logger: AppLoggerService) {

		this.logger.setContext(GameExceptionFilter.name);
	}


	catch(exception: any, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		// const client = ctx.getClient();
		// const data = ctx.getData();

		// try {
			
		// 	this.roomManager.dropRoom(data.sessionToken, exception.message)
		// }
		// catch {

		// 	client.emit('gameError', `Internal error: ${exception.message}`);
		// 	client.disconnect(true);
		// }
	}
};

@Catch(ChatException)
export class ChatExceptionFilter implements ExceptionFilter {
	constructor(private roomManager: RoomManagerService,
							private logger: AppLoggerService) {

		this.logger.setContext(ChatExceptionFilter.name);
	}

	catch(exception: any, host: ArgumentsHost) {
		const ctx = host.switchToWs();
		const client = ctx.getClient();
		const data = ctx.getData();

	}
};