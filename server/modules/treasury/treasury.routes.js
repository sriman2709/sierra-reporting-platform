import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { TreasuryService } from './treasury.service.js';
import { seedPhase4 } from './treasury.seed.js';

const router = Router();
const auth   = [authenticate, authorize('treasury')];
const wrap   = fn => async (req, res) => {
  try { res.json(await fn(req, res)); }
  catch (e) { res.status(500).json({ error: e.message }); }
};

router.get('/kpis',               ...auth, wrap(() => TreasuryService.getKPIs()));
router.get('/cash-accounts',      ...auth, wrap(() => TreasuryService.getCashAccounts()));
router.get('/investments',        ...auth, wrap(() => TreasuryService.getInvestments()));
router.get('/debt-service',       ...auth, wrap(() => TreasuryService.getDebtService()));
router.get('/tax-trend',          ...auth, wrap(() => TreasuryService.getTaxTrend()));
router.get('/revenue-by-type',    ...auth, wrap(() => TreasuryService.getRevenueByType()));
router.get('/cash-by-type',       ...auth, wrap(() => TreasuryService.getCashByType()));
router.get('/investments-by-type',...auth, wrap(() => TreasuryService.getInvestmentsByType()));

// ── One-time Phase 4 seed (protected by SEED_SECRET env var) ──────────────
router.post('/seed', async (req, res) => {
  const secret = process.env.SEED_SECRET;
  if (!secret || req.headers['x-seed-secret'] !== secret) {
    return res.status(403).json({ error: 'Forbidden — missing or invalid SEED_SECRET header' });
  }
  try {
    const logs = await seedPhase4();
    res.json({ ok: true, message: 'Phase 4 seed complete', logs });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;
