import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { EntryModule } from './entry.module'; // Assuming EntryModule is in the same directory

async function bootstrap() {
  let app;

  dotenv.config();

  try {
    app = await NestFactory.create(EntryModule);
  } catch (error) {
    const errorMessage = (error as Error).message || 'Unknown error';
    console.error('Failed to create Transendence. Exiting the process.', errorMessage);
    process.exit(1);
  }

  // Enable CORS with dynamic origin based on environment variables
  app.enableCors({
    origin: process.env.ORIGIN_URL_BACK || 'http://localhost:4000',
    credentials: true,
  });

  // Use PORT_BACKEND environment variable, default to 4000 if not set
  const port = process.env.PORT_BACKEND || 4000;
  await app.listen(port, () => {
    console.log(`NestJS origin: ${process.env.ORIGIN_URL_BACK}, listens on:${port}`);
  });

  
}

bootstrap();