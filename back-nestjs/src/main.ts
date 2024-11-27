import { NestFactory } from '@nestjs/core';
import EntryModule from './entry.module';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Notification } from './entities/notification.entity';


async function bootstrap() {
    const app = await NestFactory.create(EntryModule);
    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT_BACKEND', 4000);

    // Required for using same host for the services
    app.enableCors({
        origin: configService.get('ORIGIN_URL_FRONT') || 'http://localhost:3000',
        credentials: true,
    });
    // Enables req.cookies
    app.use(cookieParser());

    // For now unnecessary because single cookie is enough
    // // Define cookie configuration
    // const cookieConfig = {
    //     maxAge: 24 * 60 * 60 * 1000, // hour * minute * second * milisecond
    //     // secure: 'production', // used with HTTPS websites
    //     // httpOnly: true, // prevents client-side JavaScript from accessing the cookie
    // };

    // // Define session configuration
    // const sessionConfig = {
    //     secret: configService.get<string>('SECRET_PWD') || "none",
    //     resave: false,
    //     saveUninitialized: false,
    //     cookie: cookieConfig, // Include cookie configuration
    //     rolling: true, // used to update cookies in each request
    // };

    // app.use(session(sessionConfig));


    // Unknown may be needed later?
    // const passp = require('passport');
    // app.use(passp.initialize());
    // app.use(passp.session());

    // This option tells the ValidationPipe to automatically transform the input data
    // to the type of the object that is expected by the route handler.
    app.useGlobalPipes(new ValidationPipe({
        transform: true,
    }));

    // Configures TypeORM to connect to a PostgreSQL database
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: configService.get('POSTGRES_HOST'),
      port: configService.get('PORT_POSTGRES'),
      username: configService.get('POSTGRES_USER'),
      password: configService.get('POSTGRES_PASSWORD'),
      database: configService.get('POSTGRES_DB'),
      entities: [User, Notification], // List your entities here
      synchronize: true,
    });

    await app.listen(port).catch(() => {
        console.log(`listen to ${port} failed`);
        process.exit(1);
    });
}

bootstrap();