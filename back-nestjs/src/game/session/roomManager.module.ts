import { Module, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import RoomManagerGateway from 'src/game/session/roomManager.gateway';
import RoomManagerService from 'src/game/session/roomManager.service';
import ExceptionModule from 'src/errors/exception.module';
import AppLoggerModule from 'src/log/log.module';
import ExceptionFactory from 'src/errors/exceptionFactory.service';
import { GameMode } from 'src/game/game.types';
import SimulationService from 'src/game/session/simulation.service';
import AppLoggerService from 'src/log/log.service';

@Module({
	imports: [AppLoggerModule, forwardRef(() => ExceptionModule)],
	providers: [
		RoomManagerGateway,
		RoomManagerService,
		//SimulationService, needs a factory to create a new instance every time
		{
			provide: 'GAME_SPAWN',
			useFactory: (logger: AppLoggerService, thrower: ExceptionFactory, config: ConfigService) => {
				return (sessionToken: string, mode: GameMode) => {
					const newInstance = new SimulationService(logger, thrower, config);
					newInstance.setInitInfo(sessionToken, mode);

					return newInstance;
				};
			},
			inject: [AppLoggerService, ExceptionFactory, ConfigService],
		},
	],
	exports: [RoomManagerService],
})
export default class RoomManagerModule {}
