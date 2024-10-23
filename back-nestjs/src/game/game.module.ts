import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import GameController from './game.controller';
import GameService from './game.service';


@Module({
  controllers: [GameController],
  providers: [GameService, Type],
  exports: [GameService],
  imports: [TypeOrmModule],
})
export default class GameModule {};