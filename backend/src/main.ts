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
    
    // CORS is now entirely handled by Vercel Edge (vercel.json) to prevent duplicates
    // app.enableCors({ ... });
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
  // If Vercel routes an OPTIONS preflight to the function, just return 200 OK
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
    console.error('[Bootstrap] Handler caught an error:', err);
    res.status(500).json({ error: 'Initialization error', message: err.message, stack: err.stack });
  }
};

