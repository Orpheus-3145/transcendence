import { Module } from '@nestjs/common';

import MatchmakingModule from './matchmaking/matchmaking.module';
import RoomManagerModule from './session/roomManager.module';


@Module({
	imports: [MatchmakingModule, RoomManagerModule],
	exports: [MatchmakingModule, RoomManagerModule],
})
export default class GameModule {}
