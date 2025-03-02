import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { Message, Channel, ChannelMember } from 'src/entities/chat.entity';
import { UsersModule } from 'src/users/users.module';
import { NotificationModule } from 'src/notification/notification.module';
import { NotificationGateway } from 'src/notification/notification.gateway';

@Module({
	imports: [TypeOrmModule.forFeature([Channel, ChannelMember, Message]), forwardRef(() => UsersModule),  forwardRef(() => NotificationModule)],
	providers: [ChatService, ChatGateway],
	controllers: [ChatController],
	exports: [ChatService],
})
export class ChatModule {}
