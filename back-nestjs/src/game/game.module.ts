import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import GameController from './game.controller';
import GameService from './game.service';
import { UsersModule } from '../users/users.module';
import { SimulationModule } from './simulation/simulation.module';

@Module({
  exports: [GameService, SimulationModule],
  controllers: [GameController],
  providers: [GameService, GameGateway],
  imports: [UsersModule, TypeOrmModule],
})
export default class GameModule {}
