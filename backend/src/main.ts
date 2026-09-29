import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

// The Vite dev server the frontend runs on. Read from the environment so a
// deployed frontend does not need a code change — and kept as a list of exact
// origins rather than `origin: true`, which would let any site call this API
// with the visitor's credentials.
const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: allowedOrigins });

  app.setGlobalPrefix('api');

  // The request body is the boundary of the application, so it is validated
  // here and nowhere else. `forbidNonWhitelisted` turns a misspelled field into
  // a 400 instead of a book quietly saved without it.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
