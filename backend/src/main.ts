import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();
let initialized = false;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  
  app.use(cookieParser());
  
  const configService = app.get(ConfigService);
  const frontendUrl = configService.get<string>('FRONTEND_URL');
  const allowedOrigins = frontendUrl ? frontendUrl.split(',') : ['http://localhost:5173', 'http://localhost:5174'];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  await app.init();
  initialized = true;
  
  // Only listen on a port if not running in a serverless environment (like Vercel)
  if (!process.env.VERCEL) {
    const port = configService.get<number>('PORT') || 3000;
    await app.listen(port);
  }
}

const bootstrapPromise = bootstrap();

export default async (req: any, res: any) => {
  if (!initialized) {
    await bootstrapPromise;
  }
  server(req, res);
};

