import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import GameController from './game.controller';
import GameService from './game.service';
import SimulationModule from './simulation/simulation.module';


@Module({
  controllers: [GameController],
  providers: [GameService],
  imports: [SimulationModule],
})
export default class GameModule {}
