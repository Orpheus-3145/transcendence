import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import AppLoggerModule from 'src/log/log.module';

@Module({
	exports: [AuthService],
	controllers: [AuthController],
	providers: [AuthService],
	imports: [UsersModule, AppLoggerModule],
})
export class AuthModule {}
