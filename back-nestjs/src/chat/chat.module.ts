import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { Message, Channel, ChannelMember } from 'src/entities/chat.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([Channel, ChannelMember, Message]),
	],
	providers: [ChatService, ChatGateway],
	controllers: [ChatController],
	exports: [ChatService],
})
export class ChatModule {}
