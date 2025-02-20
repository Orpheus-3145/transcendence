import { Module } from '@nestjs/common';

import { AuthController } from 'src/auth/auth.controller';
import { AuthService } from 'src/auth/auth.service';
import UsersModule from 'src/users/users.module';
import AppLoggerModule from 'src/log/log.module';
import ExceptionModule from 'src/errors/exception.module';

@Module({
	imports: [UsersModule, AppLoggerModule, ExceptionModule],
	controllers: [AuthController],
	providers: [AuthService],
	exports: [AuthService],
})
export class AuthModule {}
