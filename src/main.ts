import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Para poder realizar la validacion
  app.useGlobalPipes(new ValidationPipe());
  // Ip del servidor local
  await app.listen(3000, '192.168.1.8' || 'localhost');
}
bootstrap();
