import { Module } from '@nestjs/common';
import { ConfigModule} from '@nestjs/config';

import MatchmakingGateway from './game.matchmaking.gateway';
import SimulationGateway from './game.simulation.gateway';
import MatchmakingService from './game.matchmaking.service';
import SimulationService from './game.simulation.service';
import { RoomManagerService } from './game.roomManager.service';
import AppLoggerModule from 'src/log/log.module';

@Module({
  imports: [ConfigModule,
            AppLoggerModule],
  providers: [MatchmakingGateway,
              MatchmakingService,
              SimulationGateway,
              SimulationService,
			        RoomManagerService],
})
export default class MatchmakingModule {}
