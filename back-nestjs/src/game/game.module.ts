import { Module } from '@nestjs/common';

import MatchmakingGateway from './matchmaking.gateway';
import SimulationGateway from './simulation.gateway';
import MatchmakingService from './matchmaking.service';
import SimulationService from './simulation.service';


@Module({
  providers: [MatchmakingGateway,
              MatchmakingService,
              SimulationGateway,
              SimulationService],
})
export default class MatchmakingModule {};
