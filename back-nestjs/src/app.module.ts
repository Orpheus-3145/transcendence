import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import User from 'src/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import UsersModule from 'src/users/users.module';
import GameModule from 'src/game/game.module';
import ExceptionModule from 'src/errors/exception.module';
import AppLoggerModule from 'src/log/log.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				type: 'postgres',
				host: configService.get<string>('POSTGRES_HOST'),
				port: configService.get<number>('PORT_POSTGRES', 5432),
				username: configService.get<string>('POSTGRES_USER'),
				password: configService.get<string>('POSTGRES_PASSWORD'),
				database: configService.get<string>('POSTGRES_DB'),
				entities: [User], // List your entities here
				synchronize: true,
				// logging: true,
			}),
		}),
		AuthModule,
		GameModule,
		UsersModule,
		AppLoggerModule,
		ExceptionModule,
	],
})
export default class AppModule {}
