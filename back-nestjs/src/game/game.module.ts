import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { UsersModule } from '../users/users.module';

@Module({
  exports: [GameService],
  controllers: [GameController],
  providers: [GameService],
  imports: [UsersModule],
})
export class GameModule {}
