import { NestFactory } from '@nestjs/core';
import { EntryModule } from './entry.module';
import * as fs from 'fs'; // Filesystem

async function bootstrap() {

  let app;

  const httpsOptions = {
    key: fs.readFileSync('/certs/key.pem'),
    cert: fs.readFileSync('/certs/cert.pem'),
  };

  try {
    app = await NestFactory.create(EntryModule, {httpsOptions});
  } catch (error) {
    const errorMessage = (error as Error).message || 'Unknown error';
    console.error('Failed to create Transendence. Exiting the process.', errorMessage);
    process.exit(1);
  }

  app.enableCors({
    origin: process.env.ORIGIN_NAME || 'http://localhost:3001',
    credentials: true,
  });

  /*
    session, configs:
      cookie:
      secret
      resave
      saveUninitialized
  */

  const port = process.env.P_NESTJS ? parseInt(process.env.P_NESTJS, 10) : 3000;
  try {
    await app.listen(port);
  } catch (error) {
    const errorMessage = (error as Error).message || 'Unknown error';
    console.error(`Failed to start Transendence on port ${port}. Exiting the process.`, errorMessage);
    process.exit(1);
  }

  /*
    passport:
      init
      session
  */

  await app.listen(port);
  /*
    initilize general chat room service
  */
}
bootstrap();
