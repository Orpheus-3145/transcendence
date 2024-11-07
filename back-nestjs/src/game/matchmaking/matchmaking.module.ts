import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';

import { MatchmakingGateway } from './matchmaking.gateway';
// import { UsersModule } from '../../users/users.module';


@Module({
  providers: [MatchmakingGateway],
})
export default class MatchmakingModule {};
