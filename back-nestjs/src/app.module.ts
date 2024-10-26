import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule } from '@nestjs/core';

import { AuthController } from './auth/auth.controller';
import { UsersController } from './users/users.controller';
import { AuthModule } from './auth/auth.module';
import { User } from './entities/user.entity';

import GameModule from './game/game.module';

@Module({
  controllers: [AuthController, UsersController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    GameModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('PORT_POSTGRES'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DB'),
        entities: [User], // List your entities here
        synchronize: true,
        // logging: true,
      }),
    }),
  ],
})
export default class AppModule {};