import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { UsersModule } from 'src/users/users.module';
import { NotificationController } from './notification.controller';
import { Notification } from '../entities/notification.entity';
import { User } from 'src/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [TypeOrmModule.forFeature([Notification]), forwardRef(() => UsersModule)],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService, TypeOrmModule],
})
export class NotificationModule {}

