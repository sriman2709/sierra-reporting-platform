import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { ExecutiveService } from './executive.service.js';

const router = Router();
const auth   = [authenticate, authorize('executive')];
const wrap   = fn => async (req, res) => {
  try { res.json(await fn(req, res)); }
  catch (e) { res.status(500).json({ error: e.message }); }
};

router.get('/kpis',          ...auth, wrap(() => ExecutiveService.getCrossDomainKPIs()));
router.get('/alerts',        ...auth, wrap(() => ExecutiveService.getAlerts()));
router.get('/benchmarks',    ...auth, wrap(() => ExecutiveService.getBenchmarks()));
router.get('/grant-trend',   ...auth, wrap(() => ExecutiveService.getGrantTrend()));
router.get('/domain-risk',   ...auth, wrap(() => ExecutiveService.getDomainRisk()));
router.get('/budget-actual', ...auth, wrap(() => ExecutiveService.getBudgetActual()));

export default router;
