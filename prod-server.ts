// Self-hosted production entrypoint: the API from server.ts plus the built
// client from dist/, as one long-lived Node process (`npm run build && npm start`).
//
// Vercel does NOT use this file — there it is api/[...path].ts per request, with
// the CDN serving dist/. This exists for running the app anywhere that has a
// real process: a container, a VM, or `npm start` locally against a production
// build.
import 'dotenv/config';
import express from 'express';
import path from 'path';
import app from './server';

const PORT = Number(process.env.PORT) || 3000;
const distPath = path.join(process.cwd(), 'dist');

app.use(express.static(distPath));

// SPA fallback, registered last so it can't shadow the /api routes above.
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`HeatOps server running on http://localhost:${PORT}`);
});
