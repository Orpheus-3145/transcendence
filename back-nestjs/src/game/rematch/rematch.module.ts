import { Module, forwardRef } from '@nestjs/common';

import RematchGateway from './rematch.gateway';
import RematchService from './rematch.service';
import ExceptionModule from 'src/errors/exception.module';
import AppLoggerModule from 'src/log/log.module';
import RoomManagerModule from 'src/game/session/roomManager.module';

@Module({
	imports: [AppLoggerModule, RoomManagerModule, forwardRef(() => ExceptionModule)],
	providers: [RematchGateway, RematchService],
	exports: [RematchService],
})
export default class RematchModule {}
