import {
	Inject,
	forwardRef,
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
	HttpStatus,
	Redirect,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { GameException,
	SessionException,
	ChatException} from 'src/errors/exceptions';
import RoomManagerService from 'src/game/session/roomManager.service';
import AppLoggerService from 'src/log/log.service';


@Catch(GameException)
export class GameExceptionFilter implements ExceptionFilter {
	
	constructor(private readonly logger: AppLoggerService,
							private readonly config: ConfigService,
							@Inject(forwardRef(() => RoomManagerService)) private readonly roomManager: RoomManagerService,) {

		this.logger.setContext(GameExceptionFilter.name);
	}

	catch(exception: any, host: ArgumentsHost) {

		this.logger.error(`Exception caught - trace: ${exception.message}`);
		
		const ctx = host.switchToWs();
		const client = ctx.getClient();
		const data = ctx.getData();

		try {

			this.roomManager.dropRoom(data.sessionToken, exception.message)
		}
		catch {

			client.emit('gameError', `Internal error: ${exception.message}`);
			client.disconnect(true);
			this.logger.error(`Client [${client.id} - ${client.handshake.address}] forced to disconnect`)
		}
	}
};

@Catch(SessionException)
export class SessionExceptionFilter implements ExceptionFilter {
	
	constructor(private readonly logger: AppLoggerService,
							private readonly config: ConfigService) {

		this.logger.setContext(GameExceptionFilter.name);
	}

	catch(exception: any, host: ArgumentsHost) {

		this.logger.error(`Exception caught - trace: ${exception.message}`);
		
		const ctx = host.switchToHttp();
		const response = ctx.getResponse();
		const request = ctx.getRequest();

		const status = exception.getStatus();
		const errorTrace = exception.message || 'Unexpected error';
		
		response.clearCookie('auth_token');
		response.status(status).json({
			statusCode: status,
			redirectTo: this.config.get<string>('URL_FRONTEND_LOGIN'),
			timestamp: new Date().toISOString(),
			path: request.url,
			message: errorTrace,
		});
	}
};

@Catch(ChatException)
export class ChatExceptionFilter implements ExceptionFilter {
	
	constructor(private readonly logger: AppLoggerService,
							private readonly config: ConfigService) {

		this.logger.setContext(ChatExceptionFilter.name);
	}

	catch(exception: any, host: ArgumentsHost) {

		this.logger.error(`Exception caught - trace: ${exception.message}`);
		
		const ctx = host.switchToWs();
		const client = ctx.getClient();
		const data = ctx.getData();

		// do the stuff for chat
	}
};