import { Module } from '@nestjs/common';
import AppLoggerService from './log.service';

@Module({
	providers: [AppLoggerService],
	exports: [AppLoggerService],
})
export default class AppLoggerModule {}
