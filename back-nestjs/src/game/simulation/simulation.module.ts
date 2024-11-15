import { Module } from '@nestjs/common';
import { SimulationService } from './simulation.service';
import SimulationGateway from './simulation.gateway'

@Module({
  providers: [SimulationGateway, SimulationService],
})
export default class SimulationModule {}

