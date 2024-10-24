import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

import AppModule from './app.module';


async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT_BACKEND', 4000);

    // Required for using same host for the services
    app.enableCors({
        origin: configService.get('ORIGIN_URL_FRONT') || 'http://localhost:3000',
        credentials: true,
    });

    // Enables req.cookies
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({
        transform: true,
    }));

    await app.listen(port).catch(() => {
        console.log(`listen to ${port} failed`);
        process.exit(1);
    });
}

bootstrap();