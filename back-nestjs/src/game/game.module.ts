import { Module } from '@nestjs/common';

import MatchmakingModule from 'src/game/matchmaking/matchmaking.module';
import RoomManagerModule from 'src/game/session/roomManager.module';

@Module({
	imports: [MatchmakingModule, RoomManagerModule],
	exports: [MatchmakingModule, RoomManagerModule],
})
export default class GameModule {}
