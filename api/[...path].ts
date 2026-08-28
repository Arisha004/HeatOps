// Vercel serverless entry point.
//
// Vercel has no long-lived process, so `npm start` (node build/server.cjs) never
// runs there. Without this file every /api/* route 404s and the client reports a
// failed analysis — calling neither FortyGuard nor Gemini.
//
// The catch-all filename is load-bearing. A plain `api/index.ts` is only mounted
// at /api and /api/index, so reaching /api/analyze-heat needs a vercel.json
// rewrite, and that rewrite only works if the platform forwards the original
// request path to the function rather than the rewritten one. `[...path]` makes
// Vercel's own filesystem routing match every /api/* path directly, so Express
// sees the real URL and the routing no longer depends on rewrite semantics.
//
// Static assets and the SPA shell are served from dist/ by the CDN, so the
// static/SPA handlers in startServer() are not needed (and are not registered
// when process.env.VERCEL is set).
import app from '../server';

export default app;
