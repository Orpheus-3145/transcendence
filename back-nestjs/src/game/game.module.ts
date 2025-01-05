import { Module } from '@nestjs/common';
import { ConfigModule} from '@nestjs/config';
// import { APP_FILTER } from '@nestjs/core';

import MatchmakingGateway from './game.matchmaking.gateway';
import RoomManagerGateway from './game.roomManager.gateway';
import MatchmakingService from './game.matchmaking.service';
// import SimulationService from './game.simulation.service';
import { RoomManagerService } from './game.roomManager.service';
import GameExceptionFilter from 'src/errors/GameExceptionFilter';
import AppLoggerModule from 'src/log/log.module';

@Module({
  imports: [ConfigModule,
            AppLoggerModule],
  providers: [MatchmakingGateway,
              MatchmakingService,
              RoomManagerGateway,
			        RoomManagerService,
            ],
})
export default class GameModule {}
