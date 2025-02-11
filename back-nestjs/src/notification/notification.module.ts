import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { UsersModule } from 'src/users/users.module';
import { NotificationController } from './notification.controller';
import { Notification } from '../entities/notification.entity';
import { NotificationGateway } from './notification.gateway';

@Module({
	imports: [TypeOrmModule.forFeature([Notification]), forwardRef(() => UsersModule)],
	controllers: [NotificationController],
	providers: [NotificationService, NotificationGateway], //need to add the NotificationGateway
	exports: [NotificationService, TypeOrmModule],
})
export class NotificationModule {}

