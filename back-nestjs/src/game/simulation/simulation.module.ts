// simulation/simulation.module.ts
import { Module } from '@nestjs/common';
import SimulationController from './simulation.controller';
import { SimulationService } from './simulation.service';
import { GameGateway } from '../game.gateway';

@Module({
  controllers: [SimulationController],
  providers: [SimulationService, GameGateway],
  exports: [SimulationService], // Export to use in game module
})
export class SimulationModule {}

