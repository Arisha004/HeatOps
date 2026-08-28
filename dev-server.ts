// Local development entrypoint: the API from server.ts plus Vite's dev
// middleware (HMR, on-the-fly TS/JSX transforms) on one port.
//
// This is deliberately a separate file from server.ts. Vite is imported here at
// the top level, where it belongs, and server.ts stays free of it — so the
// serverless bundler that builds api/[...path].ts never sees Vite in its import
// graph. Run with `npm run dev`.
import 'dotenv/config';
import { createServer as createViteServer } from 'vite';
import app from './server';

const PORT = Number(process.env.PORT) || 3000;

const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: 'spa',
});

// Mounted after server.ts has registered its /api routes, so the SPA catch-all
// never shadows them.
app.use(vite.middlewares);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`HeatOps dev server running on http://localhost:${PORT}`);
});
