import { Module, forwardRef } from '@nestjs/common';

import {
	GameExceptionFilter,
	ChatExceptionFilter,
	SessionExceptionFilter,
} from 'src/errors/exceptionFilters';
import ExceptionFactory from 'src/errors/exceptionFactory.service';
import RoomManagerModule from 'src/game/session/roomManager.module';
import AppLoggerModule from 'src/log/log.module';

@Module({
	imports: [
		AppLoggerModule,
		forwardRef(() => RoomManagerModule),
	],
	providers: [
		GameExceptionFilter,
		ChatExceptionFilter,
		SessionExceptionFilter,
		ExceptionFactory
	],
	exports: [
		GameExceptionFilter,
		ChatExceptionFilter,
		SessionExceptionFilter,
		ExceptionFactory
	],
})
export default class ExceptionModule {}
