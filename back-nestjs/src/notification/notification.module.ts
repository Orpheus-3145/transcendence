import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NotificationService } from './notification.service';
import { UsersModule } from 'src/users/users.module';
import { Notification } from '../entities/notification.entity';
import { NotificationGateway } from './notification.gateway';
import GameModule from 'src/game/game.module';
import AppLoggerModule from 'src/log/log.module';
import ExceptionModule from 'src/errors/exception.module';

@Module({
	imports: [
		GameModule,
		AppLoggerModule,
		ExceptionModule,
		TypeOrmModule.forFeature([Notification]),
		forwardRef(() => UsersModule),
	],
	providers: [NotificationService, NotificationGateway],
	exports: [NotificationService, NotificationGateway],
})
export class NotificationModule {}

