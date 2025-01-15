import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import UsersService from 'src/users/users.service';
import User from 'src/entities/user.entity';
import AppLoggerModule from 'src/log/log.module';
import ExceptionModule from 'src/errors/exception.module';

@Module({
	imports: [TypeOrmModule.forFeature([User]), AppLoggerModule, ExceptionModule],
	providers: [UsersService],
	exports: [UsersService, TypeOrmModule],
})
export default class UsersModule {}
