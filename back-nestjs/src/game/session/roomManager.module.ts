import { Module, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import RoomManagerGateway from 'src/game/session/roomManager.gateway';
import RoomManagerService from 'src/game/session/roomManager.service';
import ExceptionModule from 'src/errors/exception.module';
import AppLoggerModule from 'src/log/log.module';
import ExceptionFactory from 'src/errors/exceptionFactory.service';
import SimulationService from 'src/game/session/simulation.service';
import AppLoggerService from 'src/log/log.service';
import GameDataDTO from 'src/dto/gameData.dto';
import { UsersModule } from 'src/users/users.module';

@Module({
	imports: [AppLoggerModule, forwardRef(() => ExceptionModule), forwardRef(() => UsersModule)],
	providers: [
		RoomManagerGateway,
		RoomManagerService,
		{
			//SimulationService, needs a factory to create a new instance every time
			provide: 'GAME_SPAWN',
			useFactory: (logger: AppLoggerService, thrower: ExceptionFactory, config: ConfigService) => {
				return (data: GameDataDTO) => {
					const newInstance = new SimulationService(logger, thrower, config);
					newInstance.setGameData(data);

					return newInstance;
				};
			},
			inject: [AppLoggerService, ExceptionFactory, ConfigService],
		},
	],
	exports: [RoomManagerService],
})
export default class RoomManagerModule {}
