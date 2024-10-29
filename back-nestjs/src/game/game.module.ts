import { Module } from '@nestjs/common';

import GameController from './game.controller';
import GameService from './game.service';
// import MatchmakingModule from './matchmaking/matchmaking.module';

@Module({
  controllers: [GameController],
  providers: [GameService],
  // imports: [MatchmakingModule],
})
export default class GameModule {};
