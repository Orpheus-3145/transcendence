import { NestFactory } from '@nestjs/core';
import EntryModule from './entry.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(EntryModule);
    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT_BACKEND', 4000);

    // Required for using same host for the services
    app.enableCors({
        origin: configService.get('ORIGIN_URL_FRONT') || 'http://localhost:3000',
        credentials: true,
    });
    app.use(cookieParser());

    // Define cookie configuration
    const cookieConfig = {
        maxAge: 24 * 60 * 60 * 1000, // hour * minute * second * milisecond
        // secure: 'production', // used with HTTPS websites
        // httpOnly: true, // prevents client-side JavaScript from accessing the cookie
    };

    // Define session configuration
    const sessionConfig = {
        secret: configService.get<string>('SECRET_PWD') || "none",
        resave: false,
        saveUninitialized: false,
        cookie: cookieConfig, // Include cookie configuration
        rolling: true, // used to update cookies in each request
    };

    app.use(session(sessionConfig));

    const passp = require('passport');
    app.use(passp.initialize());
    app.use(passp.session());

    // This option tells the ValidationPipe to automatically transform the input data
    // to the type of the object that is expected by the route handler.
    app.useGlobalPipes(new ValidationPipe({
        transform: true,
    }));

    await app.listen(port).catch(() => {
        console.log(`listen to ${port} failed`);
        process.exit(1);
    });
}

bootstrap();