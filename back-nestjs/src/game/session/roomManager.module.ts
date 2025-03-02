import { Module, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import RoomManagerGateway from 'src/game/session/roomManager.gateway';
import RoomManagerService from 'src/game/session/roomManager.service';
import ExceptionModule from 'src/errors/exception.module';
import AppLoggerModule from 'src/log/log.module';
import ExceptionFactory from 'src/errors/exceptionFactory.service';
import SimulationService from 'src/game/session/simulation.service';
import AppLoggerService from 'src/log/log.service';
import GameDataDTO from 'src/dto/gameData.dto';
import Game from 'src/entities/game.entity';
import User from 'src/entities/user.entity';
import { UsersModule } from 'src/users/users.module';


@Module({
	imports: [AppLoggerModule, forwardRef(() => UsersModule), forwardRef(() => ExceptionModule), TypeOrmModule.forFeature([Game, User])],
	providers: [
		RoomManagerGateway,
		RoomManagerService,
		SimulationService,
		{
			// SimulationService factory
			provide: 'GAME_SPAWN',
			useFactory: (
				logger: AppLoggerService,
				thrower: ExceptionFactory,
				config: ConfigService,
				gameRepo: Repository<Game>,
				userRepo: Repository<User>,
				simulationService: SimulationService
			) => {
				return (data: GameDataDTO) => {
					const newInstance = Object.assign(Object.create(Object.getPrototypeOf(simulationService)), simulationService);
					newInstance.setGameData(data);
					return newInstance;
				};
			},
			inject: [AppLoggerService, ExceptionFactory, ConfigService, getRepositoryToken(Game), getRepositoryToken(User), SimulationService],
		},
	],
	exports: [RoomManagerService],
})
export default class RoomManagerModule {}








