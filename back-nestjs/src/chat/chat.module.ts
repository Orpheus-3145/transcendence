import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { Channel, ChannelMember } from 'src/entities/chat.entity';
import { NotificationModule } from 'src/notification/notification.module';
import { Message } from 'src/entities/message.entity';
import User from 'src/entities/user.entity';


@Module({
	imports: [
		NotificationModule,
		TypeOrmModule.forFeature([Channel, ChannelMember, Message, User]),
	],
	providers: [ChatService, ChatGateway],
	exports: [ChatService],
})
export class ChatModule {}
