/**
 * transparency.routes.js
 * PUBLIC endpoints — no authentication required.
 * Mounted at /api/public — accessible to any citizen without login.
 */
import { Router } from 'express';
import { TransparencyService } from './transparency.service.js';

const router = Router();

// Rate-limit friendly wrapper — no auth, errors return clean JSON
const wrap = fn => async (req, res) => {
  try { res.json(await fn(req, res)); }
  catch (e) { res.status(500).json({ error: e.message }); }
};

// ── Public endpoints (no token required) ──────────────────────────────────────
router.get('/kpis',           wrap(() => TransparencyService.getKPIs()));
router.get('/grants',         wrap(() => TransparencyService.getGrantAwards()));
router.get('/spending',       wrap(() => TransparencyService.getSpendingByFund()));
router.get('/cafr',           wrap(() => TransparencyService.getCafrSummary()));
router.get('/tax',            wrap(() => TransparencyService.getTaxRevenue()));
router.get('/tax-trend',      wrap(() => TransparencyService.getTaxTrend()));
router.get('/outcomes',       wrap(() => TransparencyService.getOutcomes()));
router.get('/grants-by-agency', wrap(() => TransparencyService.getGrantsByAgency()));
router.get('/contracts',      wrap(() => TransparencyService.getContracts()));

export default router;
