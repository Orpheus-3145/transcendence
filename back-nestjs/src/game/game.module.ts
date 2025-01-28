import { Module } from '@nestjs/common';

import MatchmakingModule from 'src/game/matchmaking/matchmaking.module';
import RoomManagerModule from 'src/game/session/roomManager.module';
import RematchModule from './rematch/rematch.module';

@Module({
	imports: [MatchmakingModule, RoomManagerModule, RematchModule],
	exports: [MatchmakingModule, RoomManagerModule, RematchModule],
})
export default class GameModule {}
