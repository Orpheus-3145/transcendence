import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HelloController } from './testHello/hello.controller';
import { HelloService } from './testHello/hello.service';
import { ormConfig } from './orm/orm.config';

/*
  Upload handling options:
    Multer - Simple
    Formidable - Intermediate
    Busboy - Complex
*/

// Passport

// User, Auth, Chat
// Game, Gateway - Complex

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: ormConfig,
      inject: [ConfigService],
    }),
  ],
  controllers: [HelloController],
  providers: [HelloService],
})
export class EntryModule {}
