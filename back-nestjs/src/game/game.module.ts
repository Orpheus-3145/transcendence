import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule} from '@nestjs/config';

import MatchmakingGateway from './game.matchmaking.gateway';
import RoomManagerGateway from './game.roomManager.gateway';
import MatchmakingService from './game.matchmaking.service';
import { RoomManagerService } from './game.roomManager.service';
import AppLoggerModule from 'src/log/log.module';
import ExceptionModule from 'src/errors/exception.module';

@Module({
  imports: [ConfigModule,
            AppLoggerModule,
            forwardRef(() => ExceptionModule)],
  providers: [MatchmakingGateway,
              MatchmakingService,
              RoomManagerGateway,
			        RoomManagerService,
            ],
  exports: [RoomManagerService]
})
export default class GameModule {}
