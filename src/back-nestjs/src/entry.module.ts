import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// import { TypeOrmModule } from '@nestjs/typeorm';
import {HelloController} from './hello.controller';
/* ConfigModule.forRoot({ isGlobal: true })
    ConfigModule is available everwhere
    env file available
    ConfigService becomes injactable into any 'service module controller' with ConfigService
*/

/*
  Upload handling options:
    Multer - Simple
    Formidable - Intermediate
    Busboy - Complex
*/

// Passport
// typeorm

// User, Auth, Chat
// Game, Gateway - Complex

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [HelloController],
  providers: [],
})
export class EntryModule {}
