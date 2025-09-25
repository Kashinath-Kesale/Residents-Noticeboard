/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Use an environment variable for the frontend URL
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  app.enableCors({
    origin: frontendUrl,
  });

  app.useGlobalPipes(new ValidationPipe());
  
  // The port will often be set by the deployment platform automatically
  await app.listen(process.env.PORT || 4000);
}
bootstrap();