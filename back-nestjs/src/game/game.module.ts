import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import GameController from './game.controller';
import GameService from './game.service';
import { SimulationModule } from './simulation/simulation.module';
import { GameGateway } from './game.gateway';

@Module({
  controllers: [GameController],
  providers: [GameService, GameGateway],
  imports: [SimulationModule],
})
export default class GameModule {}
