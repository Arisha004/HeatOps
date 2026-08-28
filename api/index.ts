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
      // The .js extension is required, not optional. This package is ESM
      // ("type": "module"), and Node's ESM resolver does no extension guessing:
      // '../server' resolves to the literal path /var/task/server and fails with
      // ERR_MODULE_NOT_FOUND. tsconfig uses moduleResolution "bundler", which
      // permits the extensionless form at typecheck time, so `tsc --noEmit`
      // stays green while every deployed request 500s. TypeScript maps the .js
      // specifier back to server.ts at build time.
      appPromise = import('../server.js').then((m) => m.default as unknown as ExpressApp);
    }
    app = await appPromise;
  } catch (err) {
    // Let the next invocation retry rather than caching a rejected promise.
    appPromise = null;
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? String(err.stack || '').split('\n').slice(0, 6) : [];
    console.error('Failed to load server module:', err);

    // A resolution failure is ambiguous between "wrong specifier" and "the file
    // was never deployed", and those need opposite fixes. Listing what actually
    // shipped settles it without another guess-and-redeploy cycle.
    let deployedFiles: Record<string, string[] | string> = {};
    try {
      const { readdirSync } = await import('node:fs');
      const root = process.cwd();
      deployedFiles = {
        [root]: readdirSync(root),
        [`${root}/api`]: readdirSync(`${root}/api`),
      };
    } catch (listErr) {
      deployedFiles = { error: listErr instanceof Error ? listErr.message : String(listErr) };
    }

    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ error: 'server_module_load_failed', message, stack, deployedFiles }, null, 2));
    return;
  }

  return app(req, res);
}
