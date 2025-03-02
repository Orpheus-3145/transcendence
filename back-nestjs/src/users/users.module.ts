import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import User  from '../entities/user.entity';
import { NotificationModule } from 'src/notification/notification.module';
import AppLoggerModule from 'src/log/log.module';
import ExceptionModule from 'src/errors/exception.module';

@Module({
	imports: [TypeOrmModule.forFeature([User]), forwardRef(() => NotificationModule), AppLoggerModule, ExceptionModule],
	controllers: [UsersController],
	providers: [UsersService],
	exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}

