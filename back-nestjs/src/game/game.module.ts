import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import MatchmakingGateway from 'src/game/game.matchmaking.gateway';
import RoomManagerGateway from 'src/game/game.roomManager.gateway';
import MatchmakingService from 'src/game/game.matchmaking.service';
import RoomManagerService from 'src/game/game.roomManager.service';
import { GameMode } from 'src/game/game.types';
import SimulationService from 'src/game/game.simulation.service';
import ExceptionModule from 'src/errors/exception.module';
import ExceptionFactory from 'src/errors/exceptionFactory';
import AppLoggerModule from 'src/log/log.module';
import AppLoggerService from 'src/log/log.service';

@Module({
	imports: [ConfigModule,
						AppLoggerModule,
						forwardRef(() => ExceptionModule)],
	providers: [MatchmakingGateway,
							MatchmakingService,
							RoomManagerGateway,
							RoomManagerService,
							// SimulationService: needs factory to create different instances
							{
								provide: 'GAME_SPAWN',
								useFactory: (logger: AppLoggerService,
														thrower: ExceptionFactory,
														config: ConfigService) => {

									return (
										sessionToken: string,
										mode: GameMode,
									) => {
										
										const newInstance = new SimulationService(logger, thrower, config);
										newInstance.setInitInfo(sessionToken, mode);
										
										return newInstance;
									};
								},
								inject: [AppLoggerService, ExceptionFactory, ConfigService],
							}
						],
	exports: [RoomManagerService]
})
export default class GameModule {}
