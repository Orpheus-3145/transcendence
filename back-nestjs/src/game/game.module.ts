import { Module } from '@nestjs/common';

import GameController from './game.controller';
import GameService from './game.service';
import MatchmakingController from './matchmaking/matchmaking.controller';
import MatchmakingService from './matchmaking/matchmaking.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [GameController, MatchmakingController],
  providers: [GameService, MatchmakingService],
  exports: [GameService],
  imports: [UsersModule],
})
export default class GameModule {};
