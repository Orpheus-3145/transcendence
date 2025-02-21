import { Module } from '@nestjs/common';

import MatchmakingModule from 'src/game/matchmaking/matchmaking.module';
import RoomManagerModule from 'src/game/session/roomManager.module';
import InvitationModule from './invitation/invitation.module';

@Module({
	imports: [MatchmakingModule, RoomManagerModule, InvitationModule],
	exports: [MatchmakingModule, RoomManagerModule, InvitationModule],
})
export default class GameModule {}
