import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule } from '@nestjs/core';
// import { AuthController } from './auth/auth.controller';
// import { UsersController } from './users/users.controller';
import { AuthModule } from './auth/auth.module';
import { User } from './entities/user.entity';
import MatchmakingModule from './game/matchmaking/matchmaking.module';
import SimulationModule from './game/simulation/simulation.module';
import GameModule from './game/game.module';
import { UsersModule } from './users/users.module';

@Module({
  // controllers: [AuthController, UsersController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
    // GameModule,
    MatchmakingModule,
	SimulationModule,
    UsersModule,
  ],
})
export default class AppModule {};