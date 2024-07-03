import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { PassportModule } from '@nestjs/passport';

@Module({
    providers: [AuthService],
    controllers: [AuthContoller],
    imports: [],
    exports: [AuthService],
})
export class AuthModule {}