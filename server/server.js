import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes        from './modules/auth/auth.routes.js';
import grantsRoutes      from './modules/grants/grants.routes.js';
import fundsRoutes       from './modules/funds/funds.routes.js';
import subawardsRoutes   from './modules/subawards/subawards.routes.js';
import outcomesRoutes    from './modules/outcomes/outcomes.routes.js';
import auditRoutes       from './modules/audit/audit.routes.js';
import forecastRoutes    from './modules/forecast/forecast.routes.js';
import aiRoutes          from './modules/ai/ai.routes.js';
import procurementRoutes from './modules/procurement/procurement.routes.js';
import financeRoutes     from './modules/finance/finance.routes.js';
import capitalRoutes     from './modules/capital/capital.routes.js';
import assetsRoutes      from './modules/assets/assets.routes.js';
import inventoryRoutes   from './modules/inventory/inventory.routes.js';
import hrRoutes          from './modules/hr/hr.routes.js';
import fleetRoutes       from './modules/fleet/fleet.routes.js';
import treasuryRoutes      from './modules/treasury/treasury.routes.js';
import executiveRoutes     from './modules/executive/executive.routes.js';
import transparencyRoutes  from './modules/transparency/transparency.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app  = express();
const PORT = process.env.PORT || 4000;

// ── CORS: allow Vite dev server locally; in production same-origin serves everything ──
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4000',
  `https://public-sector-reporting.azurewebsites.net`,
];
app.use(cors({
  origin: (origin, cb) => {
    // allow requests with no origin (curl, Postman, same-origin in prod)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(null, true); // permissive for demo — lock down post-launch
  },
  credentials: true,
}));
app.use(express.json());

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok', ts: new Date() }));

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/grants',      grantsRoutes);
app.use('/api/funds',       fundsRoutes);
app.use('/api/subawards',   subawardsRoutes);
app.use('/api/outcomes',    outcomesRoutes);
app.use('/api/audit',       auditRoutes);
app.use('/api/forecast',    forecastRoutes);
app.use('/api/ai',          aiRoutes);
app.use('/api/procurement', procurementRoutes);
app.use('/api/finance',     financeRoutes);
app.use('/api/capital',     capitalRoutes);
app.use('/api/assets',      assetsRoutes);
app.use('/api/inventory',   inventoryRoutes);
app.use('/api/hr',          hrRoutes);
app.use('/api/fleet',       fleetRoutes);
app.use('/api/treasury',    treasuryRoutes);
app.use('/api/executive',   executiveRoutes);
app.use('/api/public',      transparencyRoutes);   // Phase 5 — no auth required

// ── Serve React build in production ──────────────────────────────────────────
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));

// SPA fallback — send index.html for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => console.log(`\n  Sierra API → http://localhost:${PORT}\n`));
