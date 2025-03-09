import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NotificationService } from './notification.service';
import { UsersModule } from 'src/users/users.module';
import { NotificationGateway } from './notification.gateway';
import GameModule from 'src/game/game.module';
import AppLoggerModule from 'src/log/log.module';
import ExceptionModule from 'src/errors/exception.module';
import { MessageNotification } from 'src/entities/messageNotification.entity';
import { GameInvitation } from 'src/entities/gameInvitation.entity';
import { FriendRequest } from 'src/entities/friendRequest.entity';
import { Message } from 'src/entities/message.entity';

@Module({
	imports: [
		GameModule,
		AppLoggerModule,
		ExceptionModule,
		UsersModule,
		TypeOrmModule.forFeature([MessageNotification, GameInvitation, FriendRequest, Message]),
	],
	providers: [NotificationService, NotificationGateway],
	exports: [NotificationService],
})
export class NotificationModule {}

