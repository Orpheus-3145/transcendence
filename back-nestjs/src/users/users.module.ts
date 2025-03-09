import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import AppLoggerModule from 'src/log/log.module';
import ExceptionModule from 'src/errors/exception.module';
import User  from '../entities/user.entity';
import Game from 'src/entities/game.entity';


@Module({
	imports: [
		AppLoggerModule,
		ExceptionModule,
		TypeOrmModule.forFeature([User, Game])
	],
	controllers: [UsersController],
	providers: [UsersService],
	exports: [UsersService],
})
export class UsersModule {}

