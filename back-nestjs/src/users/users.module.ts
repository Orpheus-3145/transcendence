import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import User  from '../entities/user.entity';
import { NotificationModule } from 'src/notification/notification.module';
import AppLoggerModule from 'src/log/log.module';
import ExceptionModule from 'src/errors/exception.module';
import Game from 'src/entities/game.entity';

@Module({
	imports: [TypeOrmModule.forFeature([User, Game]), forwardRef(() => NotificationModule), AppLoggerModule, ExceptionModule],
	controllers: [UsersController],
	providers: [UsersService],
	exports: [UsersService],
})
export class UsersModule {}

