import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth/auth.controller';
import { UsersController } from './users/users.controller';
import { NotificationController } from './notification/notification.controller';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { NotificationModule } from './notification/notification.module';
import { User } from './entities/user.entity';
import { Notification } from './entities/notification.entity';

@Module({
  controllers: [AuthController, UsersController], //NotificationController
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    //NotificationModule,
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
        entities: [User], // List your entities here //Notification
        synchronize: true,
      })
    }),
  ],
})

export default class EntryModule { }