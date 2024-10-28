import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import fs from 'fs';

import AppModule from './app.module';


async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
      httpsOptions: {
        key: fs.readFileSync(process.env.SSL_KEY_PATH),
        cert: fs.readFileSync(process.env.SSL_CERT_PATH),
        // key: fs.readFileSync('../' + process.env.SSL_KEY_PATH),
        // cert: fs.readFileSync('../' + process.env.SSL_CERT_PATH),
      }
    });
    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT_BACKEND', 4000);
    process.env.ORIGIN_URL_FRONT
    // Required for using same host for the services
    app.enableCors({
        origin: configService.get<string>('ORIGIN_URL_FRONT'),
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