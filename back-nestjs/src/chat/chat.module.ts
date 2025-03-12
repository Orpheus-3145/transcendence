import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { Channel, ChannelMember } from 'src/entities/channel.entity';
import { NotificationModule } from 'src/notification/notification.module';
import { Message } from 'src/entities/message.entity';
import User from 'src/entities/user.entity';
import ExceptionModule from 'src/errors/exception.module';
import AppLoggerModule from 'src/log/log.module';


@Module({
	imports: [
		NotificationModule,
		ExceptionModule,
		AppLoggerModule,
		TypeOrmModule.forFeature([Channel, ChannelMember, Message, User]),
	],
	providers: [ChatService, ChatGateway],
	exports: [ChatService],
})
export class ChatModule {}
