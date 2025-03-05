import { Module, forwardRef } from '@nestjs/common';

import MatchmakingGateway from 'src/game/matchmaking/matchmaking.gateway';
import MatchmakingService from 'src/game/matchmaking/matchmaking.service';
import ExceptionModule from 'src/errors/exception.module';
import AppLoggerModule from 'src/log/log.module';
import RoomManagerModule from 'src/game/session/roomManager.module';

@Module({
	imports: [AppLoggerModule, RoomManagerModule, ExceptionModule],
	providers: [MatchmakingGateway, MatchmakingService],
	exports: [MatchmakingService],
})
export default class MatchmakingModule {}
