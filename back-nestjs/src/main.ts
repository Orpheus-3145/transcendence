import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import fs from 'fs';
import { checkTLSfiles, makeTLSfiles } from './create.certs'

import AppModule from './app.module';
import AppLoggerService from './log/log.service';


async function bootstrap() {

	// creating TLS files if necessary
	if (checkTLSfiles() == false)
		makeTLSfiles();

	const app = await NestFactory.create(AppModule, {
		httpsOptions: {
			key: fs.readFileSync(process.env.SSL_KEY_PATH),
			cert: fs.readFileSync(process.env.SSL_CERT_PATH),
			ca: [fs.readFileSync(process.env.SSL_CERT_PATH)],
		},
		bufferLogs: true,
	});

	const configService = app.get(ConfigService);
	// Required for using same host for the services
	app.enableCors({
		origin: configService.get<string>('URL_FRONTEND', 'https://localhost:3000'),
		methods: ['GET', 'POST'],
		credentials: true,
	});
	
	// set logging
	const appLogger = new AppLoggerService();
	appLogger.setContext('NestJS engine');
	app.useLogger(appLogger);
	
	// Enables req.cookies
	app.use(cookieParser());
	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
		}),
	);
	
	const port = configService.get<number>('PORT_BACKEND', 4000);
	await app.listen(port).catch(() => {
		console.log(`listen to ${port} failed`);
		process.exit(1);
	});
}

bootstrap();
