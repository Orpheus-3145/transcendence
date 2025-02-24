import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { UsersModule } from 'src/users/users.module';
import { NotificationController } from './notification.controller';
import { Notification } from '../entities/notification.entity';
import { NotificationGateway } from './notification.gateway';
import { ChatModule } from 'src/chat/chat.module';

@Module({
	imports: [TypeOrmModule.forFeature([Notification]), forwardRef(() => UsersModule), forwardRef(() => ChatModule)],
	controllers: [NotificationController],
	providers: [NotificationService, NotificationGateway],
	exports: [NotificationService, TypeOrmModule],
})
export class NotificationModule {}

