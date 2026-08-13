import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();
let initialized = false;

async function bootstrap() {
  console.log('[Bootstrap] Starting application initialization...');
  try {
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
    console.log('[Bootstrap] NestFactory created successfully');
    
    app.use(cookieParser());
    
    app.enableCors({
      origin: true,
      credentials: true,
    });
    console.log('[Bootstrap] CORS configured');

    await app.init();
    console.log('[Bootstrap] app.init() successful');
    initialized = true;
    
    // Only listen on a port if not running in a serverless environment (like Vercel)
    if (!process.env.VERCEL) {
      console.log('[Bootstrap] Local environment detected, binding to port...');
      const configService = app.get(ConfigService);
      const port = configService.get<number>('PORT') || 3000;
      await app.listen(port);
      console.log(`[Bootstrap] Listening on port ${port}`);
    } else {
      console.log('[Bootstrap] Vercel environment detected, skipping app.listen()');
    }
    
    console.log('[Bootstrap] Initialization complete.');
  } catch (error) {
    console.error('[Bootstrap] CRITICAL ERROR during initialization:', error);
    throw error; // Re-throw to be caught by the serverless handler
  }
}

let bootstrapPromise: Promise<void> | null = null;

export default async (req: any, res: any) => {
  // Always set CORS headers for all requests in Vercel to avoid missing headers on 500
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (!initialized) {
      if (!bootstrapPromise) {
        bootstrapPromise = bootstrap();
      }
      await bootstrapPromise;
    }
    server(req, res);
  } catch (err: any) {
    console.error('Bootstrap error:', err);
    res.status(500).json({ error: 'Initialization error', message: err.message, stack: err.stack });
  }
};

