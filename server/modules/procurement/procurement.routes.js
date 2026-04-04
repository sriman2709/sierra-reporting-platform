import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { ProcurementService } from './procurement.service.js';

const router = Router();
const auth = [authenticate, authorize('procurement')];
const wrap = fn => async (req, res) => {
  try { res.json(await fn(req, res)); }
  catch (e) { res.status(500).json({ error: e.message }); }
};

router.get('/kpis',      ...auth, wrap(() => ProcurementService.getKPIs()));
router.get('/pipeline',  ...auth, wrap(() => ProcurementService.getPipeline()));
router.get('/contracts', ...auth, wrap(() => ProcurementService.getContracts()));
router.get('/ap-aging',  ...auth, wrap(() => ProcurementService.getAPAging()));
router.get('/vendors',   ...auth, wrap(() => ProcurementService.getVendors()));

export default router;
