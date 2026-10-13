import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';


export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const searchParams = request.nextUrl.searchParams;
  const isStrictReadiness = searchParams.get('ready') === 'true';

  let dbStatus: 'connected' | 'degraded' | 'demo_mode' | 'unconfigured' | 'timeout' = 'unconfigured';
  let isHealthy = true;

  try {
    if (isSupabaseConfigured() && supabase) {
      // Lightweight probe with 2.5s strict timeout to prevent thread blocking
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      try {
        const { error } = await supabase
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
      } catch (err: any) {
        clearTimeout(timeoutId);
        dbStatus = err?.name === 'AbortError' ? 'timeout' : 'degraded';
        if (isStrictReadiness) {
          isHealthy = false;
        }
      }
    } else {
      // In demo or local mode without Supabase credentials
      dbStatus = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ? 'demo_mode' : 'unconfigured';
    }

    const latencyMs = Date.now() - startTime;

    return NextResponse.json(
      {
        status: isHealthy ? 'ok' : 'degraded',
        service: 'royalrides-travels',
        timestamp: new Date().toISOString(),
        database: dbStatus,
        uptime_seconds: Math.round(process.uptime()),
        latency_ms: latencyMs,
      },
      {
        status: isHealthy ? 200 : 503,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    // Avoid leaking stack traces or sensitive internal paths
    return NextResponse.json(
      {
        status: 'error',
        service: 'royalrides-travels',
        timestamp: new Date().toISOString(),
        message: 'Health check probe failed',
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
