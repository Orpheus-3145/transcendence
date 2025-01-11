import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { Message, Channel, ChannelMember } from 'src/entities/chat.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([Channel, ChannelMember, Message]),
	],
	providers: [ChatService, ChatGateway],
	exports: [],
})
export class ChatModule {}
