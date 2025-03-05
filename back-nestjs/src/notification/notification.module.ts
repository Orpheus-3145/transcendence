import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { UsersModule } from 'src/users/users.module';
import { Notification } from '../entities/notification.entity';
import { NotificationGateway } from './notification.gateway';
import { ChatModule } from 'src/chat/chat.module';
import GameModule from 'src/game/game.module';
import AppLoggerModule from 'src/log/log.module';

@Module({
	imports: [
		GameModule,
		AppLoggerModule,
		TypeOrmModule.forFeature([Notification]),
		forwardRef(() => UsersModule),
		forwardRef(() => ChatModule),
	],
	providers: [NotificationService, NotificationGateway],
	exports: [NotificationService, NotificationGateway, TypeOrmModule],
})
export class NotificationModule {}

