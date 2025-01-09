import { Module, forwardRef } from '@nestjs/common';

import { GameExceptionFilter, ChatExceptionFilter, SessionExceptionFilter } from './exceptionFilters';
import ExceptionFactory from './exceptionFactory';
import GameModule from '../game/game.module';
import AppLoggerModule from '../log/log.module';


@Module({
  imports: [forwardRef(() => GameModule), AppLoggerModule],
  providers: [GameExceptionFilter, ChatExceptionFilter, SessionExceptionFilter, ExceptionFactory],
  exports: [GameExceptionFilter, ChatExceptionFilter, SessionExceptionFilter, ExceptionFactory],
})
export default class ExceptionModule {}
