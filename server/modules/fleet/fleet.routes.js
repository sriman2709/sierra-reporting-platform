import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { FleetService } from './fleet.service.js';

const router = Router();
const auth = [authenticate, authorize('fleet')];
const wrap = fn => async (req, res) => {
  try { res.json(await fn(req, res)); }
  catch (e) { res.status(500).json({ error: e.message }); }
};

router.get('/kpis',        ...auth, wrap(() => FleetService.getKPIs()));
router.get('/vehicles',    ...auth, wrap(() => FleetService.getVehicles()));
router.get('/fuel',        ...auth, wrap(() => FleetService.getFuel()));
router.get('/inspections', ...auth, wrap(() => FleetService.getInspections()));
router.get('/cost-by-dept',...auth, wrap(() => FleetService.getCostByDept()));
router.get('/utilization', ...auth, wrap(() => FleetService.getUtilization()));

export default router;
