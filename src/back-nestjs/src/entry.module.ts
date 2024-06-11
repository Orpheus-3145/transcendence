import { Module } from '@nestjs/common';

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
  imports: [],
  controllers: [],
  providers: [],
})
export class EntryModule {}
