import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: '.env.local', override: true });

import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { isSupabaseConfigured, serverSupabase } from './supabase';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 1. Health check endpoint matching /api/health
app.get('/api/health', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const isStrictReadiness = req.query.ready === 'true';

  let dbStatus: 'connected' | 'degraded' | 'demo_mode' | 'unconfigured' | 'timeout' = 'unconfigured';
  let isHealthy = true;

  try {
    if (isSupabaseConfigured() && serverSupabase) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      try {
        const { error } = await serverSupabase
          .from('site_settings')
          .select('id')
          .limit(1)
          .abortSignal(controller.signal);

        clearTimeout(timeoutId);

        if (error) {
          dbStatus = 'degraded';
          if (isStrictReadiness) {
            isHealthy = false;
          }
        } else {
          dbStatus = 'connected';
        }
      } catch (err: unknown) {
        clearTimeout(timeoutId);
        dbStatus = err instanceof Error && err.name === 'AbortError' ? 'timeout' : 'degraded';
        if (isStrictReadiness) {
          isHealthy = false;
        }
      }
    } else {
      const isDemo =
        process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
        process.env.VITE_DEMO_MODE === 'true';
      dbStatus = isDemo ? 'demo_mode' : 'unconfigured';
    }

    const latencyMs = Date.now() - startTime;

    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Content-Type': 'application/json',
    });

    return res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'ok' : 'degraded',
      service: 'royalrides-travels',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      uptime_seconds: Math.round(process.uptime()),
      latency_ms: latencyMs,
    });
  } catch (_error) {
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Content-Type': 'application/json',
    });
    return res.status(500).json({
      status: 'error',
      service: 'royalrides-travels',
      timestamp: new Date().toISOString(),
      message: 'Health check probe failed',
    });
  }
});

// 2. Cache revalidation endpoint matching /api/revalidate
app.post('/api/revalidate', (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const targetPath = typeof body.path === 'string' ? body.path : '/';

    return res.status(200).json({
      revalidated: true,
      path: targetPath,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to revalidate cache';
    return res.status(500).json({ error: message });
  }
});

// 3. Serve Vite client static assets and SPA fallback in production
const possiblePaths = [
  path.resolve(process.cwd(), 'dist/client'),
  path.resolve(__dirname, '../client'),
  path.resolve(__dirname, '../dist/client'),
  path.resolve(__dirname, './client'),
];

const staticDir = possiblePaths.find((p) => fs.existsSync(p)) || null;

if (staticDir) {
  app.use(express.static(staticDir));

  // Any non-API GET request serves index.html for React Router SPA
  app.use((req: Request, res: Response, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(staticDir, 'index.html'));
    }
    next();
  });
}

app.listen(PORT, () => {
  console.log(`[RoyalRides Server] Express backend listening on port ${PORT}`);
  if (staticDir) {
    console.log(`[RoyalRides Server] Serving static client build from: ${staticDir}`);
  }
});

export default app;
