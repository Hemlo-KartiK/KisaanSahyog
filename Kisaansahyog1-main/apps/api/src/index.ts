import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { API_HEALTH_PATH, APP_NAME } from '@kisaansahyog/shared';
import { isSupabaseConfigured } from './config/supabase.js';
import {
  handleGetListings,
  handleCreateListing,
} from './controllers/listingsController.js';
import {
  handleGetOffers,
  handleCreateOffer,
} from './controllers/offersController.js';
import marketRoutes from './routes/market.js';
import telemetryRoutes from './routes/telemetry.js';

dotenv.config();

const app = express();
const startedAt = Date.now();
const configuredPort = Number(process.env.PORT ?? 4000);
const port =
  Number.isInteger(configuredPort) && configuredPort > 0 ? configuredPort : 4000;

app.disable('x-powered-by');
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '64kb' }));

// Health Check
const handleHealth = (_request: Request, response: Response) => {
  const configured = isSupabaseConfigured();
  response.status(200).json({
    status: 'ok',
    service: '@kisaansahyog/api',
    app: APP_NAME,
    version: '1.0.0',
    port,
    uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
    timestamp: new Date().toISOString(),
    database: configured ? 'supabase' : 'in-memory-fallback',
    supabaseConfigured: configured,
  });
};

// Health route (both /health and API_HEALTH_PATH)
app.get('/health', handleHealth);
if (API_HEALTH_PATH !== '/health') {
  app.get(API_HEALTH_PATH, handleHealth);
}

// Core API Routes: /api/listings and /api/offers
app.get('/api/listings', handleGetListings);
app.post('/api/listings', handleCreateListing);
app.get('/api/offers', handleGetOffers);
app.post('/api/offers', handleCreateOffer);

// Versioned Aliases: /api/v1/listings and /api/v1/offers
app.get('/api/v1/listings', handleGetListings);
app.post('/api/v1/listings', handleCreateListing);
app.get('/api/v1/offers', handleGetOffers);
app.post('/api/v1/offers', handleCreateOffer);

// Phase 5 Telemetry Routes: /api/telemetry
app.use('/api/telemetry', telemetryRoutes);

// Extra market routes (/api/v1/farmer/:phone, /api/v1/tasks/:phone)
app.use('/api/v1', marketRoutes);

// Root informational endpoint
app.get('/', (_request, response) => {
  response.status(200).json({
    name: `${APP_NAME} API`,
    version: '1.0.0',
    health: '/health',
    endpoints: [
      '/health',
      '/api/listings',
      '/api/offers',
      '/api/telemetry/weather',
      '/api/telemetry/mandi',
      '/api/telemetry/soil',
      '/api/telemetry/advisory',
      '/api/v1/listings',
      '/api/v1/offers',
    ],
  });
});

// 404 handler
app.use((request, response) => {
  response.status(404).json({
    error: 'not_found',
    message: `No route matches ${request.method} ${request.path}.`,
  });
});

// Listen on configured port
app.listen(port, () => {
  console.log(`KisaanSahyog API listening on http://localhost:${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
});

export { handleGetListings, handleCreateListing, handleGetOffers, handleCreateOffer };
export default app;
