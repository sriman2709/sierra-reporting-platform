import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { HRService } from './hr.service.js';

const router = Router();
const auth = [authenticate, authorize('hr')];
const wrap = fn => async (req, res) => {
  try { res.json(await fn(req, res)); }
  catch (e) { res.status(500).json({ error: e.message }); }
};

router.get('/kpis',           ...auth, wrap(() => HRService.getKPIs()));
router.get('/employees',      ...auth, wrap(() => HRService.getEmployees()));
router.get('/positions',      ...auth, wrap(() => HRService.getPositions()));
router.get('/turnover',       ...auth, wrap(() => HRService.getTurnover()));
router.get('/payroll',        ...auth, wrap(() => HRService.getPayroll()));
router.get('/fund-allocation',...auth, wrap(() => HRService.getFundAllocation()));

export default router;
