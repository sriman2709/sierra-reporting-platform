import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { FinanceService } from './finance.service.js';

const router = Router();
const auth = [authenticate, authorize('finance')];
const wrap = fn => async (req, res) => {
  try { res.json(await fn(req, res)); }
  catch (e) { res.status(500).json({ error: e.message }); }
};

router.get('/kpis',            ...auth, wrap(() => FinanceService.getKPIs()));
router.get('/budget-variance', ...auth, wrap(() => FinanceService.getBudgetVariance()));
router.get('/close-readiness', ...auth, wrap(() => FinanceService.getCloseReadiness()));
router.get('/journals',        ...auth, wrap(() => FinanceService.getJournals()));
router.get('/interfund',       ...auth, wrap(() => FinanceService.getInterfund()));

export default router;
