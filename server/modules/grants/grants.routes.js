import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { GrantsService } from './grants.service.js';

const router = Router();
const auth = [authenticate, authorize('grants')];
const wrap = fn => async (req, res) => {
  try { res.json(await fn(req, res)); }
  catch (e) { res.status(500).json({ error: e.message }); }
};

router.get('/',                   ...auth, wrap(() => GrantsService.getAll()));
router.get('/kpis',               ...auth, wrap(() => GrantsService.getKPIs()));
router.get('/compliance',         ...auth, wrap(() => GrantsService.getCompliance()));
router.get('/compliance-posture', ...auth, wrap(() => GrantsService.getCompliancePosture()));
router.get('/allowability',       ...auth, wrap(() => GrantsService.getAllowability()));
router.get('/subrecipient-risk',  ...auth, wrap(() => GrantsService.getSubrecipientRisk()));
router.get('/lifecycle',          ...auth, wrap(() => GrantsService.getLifecycle()));
router.get('/burn-rate',          ...auth, wrap(() => GrantsService.getBurnRate()));
router.get('/:id',                ...auth, wrap(req  => GrantsService.getById(req.params.id)));

export default router;
