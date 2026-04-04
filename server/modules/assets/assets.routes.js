import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { AssetsService } from './assets.service.js';

const router = Router();
const auth = [authenticate, authorize('assets')];
const wrap = fn => async (req, res) => {
  try { res.json(await fn(req, res)); }
  catch (e) { res.status(500).json({ error: e.message }); }
};

router.get('/kpis',        ...auth, wrap(() => AssetsService.getKPIs()));
router.get('/assets',      ...auth, wrap(() => AssetsService.getAssets()));
router.get('/work-orders', ...auth, wrap(() => AssetsService.getWorkOrders()));
router.get('/pm-plans',    ...auth, wrap(() => AssetsService.getPMPlans()));
router.get('/failures',    ...auth, wrap(() => AssetsService.getFailures()));
router.get('/cost-by-type',...auth, wrap(() => AssetsService.getCostByType()));

export default router;
