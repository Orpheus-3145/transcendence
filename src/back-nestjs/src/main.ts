import { NestFactory } from '@nestjs/core';
import { EntryModule } from './entry.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(EntryModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT_BACKEND', 4000);

  // Required for using same host for the services
  app.enableCors({
    origin: configService.get('ORIGIN_URL_FRONT') || 'http://localhost:3000',
    credentials: true,
  });

  await app.listen(port).catch(() => {
    console.log(`listen to ${port} failed`);
    process.exit(1);
  });
}

bootstrap();