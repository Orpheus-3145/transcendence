import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import GameController from './game.controller';
import GameService from './game.service';
import { UsersModule } from '../users/users.module';

@Module({
  exports: [GameService],
  controllers: [GameController],
  providers: [GameService],
  imports: [UsersModule, TypeOrmModule],
})
export default class GameModule {}
