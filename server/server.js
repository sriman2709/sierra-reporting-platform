import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes      from './modules/auth/auth.routes.js';
import grantsRoutes    from './modules/grants/grants.routes.js';
import fundsRoutes     from './modules/funds/funds.routes.js';
import subawardsRoutes from './modules/subawards/subawards.routes.js';
import outcomesRoutes  from './modules/outcomes/outcomes.routes.js';
import auditRoutes     from './modules/audit/audit.routes.js';
import forecastRoutes  from './modules/forecast/forecast.routes.js';

const app  = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.get('/health', (_, res) => res.json({ status: 'ok', ts: new Date() }));

app.use('/api/auth',       authRoutes);
app.use('/api/grants',     grantsRoutes);
app.use('/api/funds',      fundsRoutes);
app.use('/api/subawards',  subawardsRoutes);
app.use('/api/outcomes',   outcomesRoutes);
app.use('/api/audit',      auditRoutes);
app.use('/api/forecast',   forecastRoutes);

app.listen(PORT, () => console.log(`\n  Sierra API → http://localhost:${PORT}\n`));
