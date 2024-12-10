import { Module } from '@nestjs/common';

import MatchmakingGateway from './game.matchmaking.gateway';
import SimulationGateway from './game.simulation.gateway';
import MatchmakingService from './game.matchmaking.service';
import SimulationService from './game.simulation.service';
import AppLoggerModule from 'src/log/log.module';


@Module({
	providers: [MatchmakingGateway, MatchmakingService, SimulationGateway, SimulationService],
	imports: [AppLoggerModule]
})
export default class MatchmakingModule {}
