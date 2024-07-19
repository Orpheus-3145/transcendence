import { Module } from '@nestjs/common';
import { HelloController } from './testHello/hello.controller';
import { HelloService } from './testHello/hello.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

@Module({
    controllers: [HelloController],
    exports: [],
    imports: [ConfigModule.forRoot({}), AuthModule],
    providers: [HelloService],
})

export default class EntryModule {}
