import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { CapitalService } from './capital.service.js';

const router = Router();
const auth = [authenticate, authorize('capital')];
const wrap = fn => async (req, res) => {
  try { res.json(await fn(req, res)); }
  catch (e) { res.status(500).json({ error: e.message }); }
};

router.get('/kpis',          ...auth, wrap(() => CapitalService.getKPIs()));
router.get('/projects',      ...auth, wrap(() => CapitalService.getProjects()));
router.get('/milestones',    ...auth, wrap(() => CapitalService.getMilestones()));
router.get('/change-orders', ...auth, wrap(() => CapitalService.getChangeOrders()));
router.get('/funding',       ...auth, wrap(() => CapitalService.getFunding()));
router.get('/cip-summary',   ...auth, wrap(() => CapitalService.getCIPSummary()));

export default router;
