// Vercel serverless entry point.
//
// Vercel has no long-lived process, so `npm start` (node build/server.cjs) never
// runs there. vercel.json rewrites /api/* to this function; static assets and
// the SPA shell are served from dist/ by the CDN.
//
// server.ts is imported dynamically rather than with a top-level `import` so a
// failure to load it is catchable. A module-load crash in a Vercel function is
// otherwise reported only as an opaque 500 FUNCTION_INVOCATION_FAILED with the
// real error buried in the platform logs — which is exactly how a stray Vite
// import (dragging in fsevents/lightningcss native binaries) silently took every
// /api route down. Surfacing the message in the response body makes the next
// occurrence diagnosable from a plain curl.
import type { IncomingMessage, ServerResponse } from 'http';

type ExpressApp = (req: IncomingMessage, res: ServerResponse) => void;

// Cached across warm invocations so the module is only evaluated once.
let appPromise: Promise<ExpressApp> | null = null;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  let app: ExpressApp;
  try {
    if (!appPromise) {
      appPromise = import('../server').then((m) => m.default as unknown as ExpressApp);
    }
    app = await appPromise;
  } catch (err) {
    // Let the next invocation retry rather than caching a rejected promise.
    appPromise = null;
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? String(err.stack || '').split('\n').slice(0, 6) : [];
    console.error('Failed to load server module:', err);
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ error: 'server_module_load_failed', message, stack }, null, 2));
    return;
  }

  return app(req, res);
}
