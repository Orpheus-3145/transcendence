import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import MatchmakingController from './matchmaking.controller';
import MatchmakingService from './matchmaking.service';
import { UsersModule } from '../../users/users.module';


@Module({
  exports: [MatchmakingService],
  controllers: [MatchmakingController],
  providers: [MatchmakingService],
  imports: [UsersModule, TypeOrmModule],
})
export default class MatchmakingModule {};
