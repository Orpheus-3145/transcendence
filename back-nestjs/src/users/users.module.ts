import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from '../entities/user.entity';
import AppLoggerModule from 'src/log/log.module';

@Module({
	imports: [TypeOrmModule.forFeature([User]), AppLoggerModule],
	controllers: [UsersController],
	providers: [UsersService],
	exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
