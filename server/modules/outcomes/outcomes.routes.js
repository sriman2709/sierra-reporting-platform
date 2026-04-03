import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { OutcomesService } from './outcomes.service.js';
const router = Router();
const auth = [authenticate, authorize('outcomes')];
const wrap = fn => async (req, res) => { try { res.json(await fn(req,res)); } catch(e){ res.status(500).json({error:e.message}); }};

router.get('/',                   ...auth, wrap(() => OutcomesService.getScorecard()));
router.get('/scorecard',          ...auth, wrap(() => OutcomesService.getScorecard()));
router.get('/kpis',               ...auth, wrap(() => OutcomesService.getKPIs()));
router.get('/metrics',            ...auth, wrap(() => OutcomesService.getMetrics()));
router.get('/actuals',            ...auth, wrap(() => OutcomesService.getActuals()));
router.get('/programs',           ...auth, wrap(() => OutcomesService.getPrograms()));
router.get('/cost',               ...auth, wrap(() => OutcomesService.getCost()));
router.get('/effectiveness',      ...auth, wrap(() => OutcomesService.getEffectiveness()));
router.get('/grant-linkage',      ...auth, wrap(() => OutcomesService.getGrantLinkage()));
router.get('/trend',              ...auth, wrap(() => OutcomesService.getTrend()));
router.get('/cost-effectiveness', ...auth, wrap(() => OutcomesService.getCostEffectiveness()));
export default router;
