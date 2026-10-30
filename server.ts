/**
 * Vrijbaan Express Backend Server & NDW Open Data Proxy
 * Verwerkt conditionele aanvragen (ETag / If-None-Match) conform specificatie [G-5]
 * en mount Vite dev middleware op poort 3000.
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// In-memory state voor NDW ETag en actuele data
let currentETag = `W/"vrijbaan-${Date.now()}"`;
let lastDataUpdateTime = Date.now();

// Endpoint voor conditioneel verversen conform [G-5]
app.get('/api/traffic/refresh', (req: Request, res: Response) => {
  const clientETag = req.headers['if-none-match'];

  // Controleer of de data sinds minder dan 45 seconden geleden al ververst is en client de huidige ETag heeft
  const ageSec = (Date.now() - lastDataUpdateTime) / 1000;
  if (clientETag === currentETag && ageSec < 45) {
    // [G-5] Is een bestand niet veranderd, dan wordt er niets gedownload (304 Not Modified)
    return res.status(304).end();
  }

  // Update ETag en timestamp voor een nieuwe ronde
  lastDataUpdateTime = Date.now();
  currentETag = `W/"vrijbaan-${lastDataUpdateTime}"`;

  res.setHeader('ETag', currentETag);
  res.setHeader('Cache-Control', 'public, max-age=60');

  // Retourneer status
  return res.json({
    status: 'ok',
    updatedAt: lastDataUpdateTime,
    source: 'NDW opendata.ndw.nu',
    etag: currentETag
  });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', app: 'Vrijbaan', timestamp: Date.now() });
});

async function startServer() {
  if (!isProd) {
    // Dev-modus: Integreer Vite via middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT
      },
      appType: 'spa'
    });

    app.use(vite.middlewares);
  } else {
    // Productiemodus: Statische bestanden serveren
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Vrijbaan] Server draait op http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[Vrijbaan] Server startfout:', err);
  process.exit(1);
});
