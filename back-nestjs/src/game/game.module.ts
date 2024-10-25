import { Module } from '@nestjs/common';

import GameController from './game.controller';
import GameService from './game.service';
import MatchmakingModule from './matchmaking/matchmaking.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  exports: [GameService],
  controllers: [GameController],
  providers: [GameService],
  imports: [UsersModule]
})
export default class GameModule {};
