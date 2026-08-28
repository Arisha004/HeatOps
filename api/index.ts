// Vercel serverless entry point.
//
// Vercel has no long-lived process, so `npm start` (node dist/server.cjs) never
// runs there. Without this file every /api/* route 404s and the client silently
// falls back to locally generated placeholder data — the app looks like it works
// while calling neither FortyGuard nor Gemini.
//
// vercel.json routes /api/* here; static assets and the SPA shell are served
// from dist/ by the CDN, so the static/SPA handlers in startServer() are not
// needed (and are not registered when process.env.VERCEL is set).
import app from '../server';

export default app;
