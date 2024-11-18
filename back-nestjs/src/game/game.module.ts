import { Module } from '@nestjs/common';
import { ConfigModule} from '@nestjs/config';

import MatchmakingGateway from './game.matchmaking.gateway';
import SimulationGateway from './game.simulation.gateway';
import MatchmakingService from './game.matchmaking.service';
import SimulationService from './game.simulation.service';


@Module({
  imports: [ConfigModule],
  providers: [MatchmakingGateway,
              MatchmakingService,
              SimulationGateway,
              SimulationService],
})
export default class MatchmakingModule {};
