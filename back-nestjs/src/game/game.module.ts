import { Module } from '@nestjs/common';

import MatchmakingGateway from './matchmaking.gateway';
import MatchmakingService from './matchmaking.service';
import SimulationGateway from './simulation.gateway';
import SimulationService from './simulation.service';


@Module({
  providers: [MatchmakingGateway, MatchmakingService, SimulationService],
})
export default class MatchmakingModule {};
