/**
 * agents.routes.js
 * POST /api/agents/:type/run  — triggers an autonomous agent analysis run
 * All routes require authentication; role requirements vary by domain.
 */
import { Router }                        from 'express';
import { authenticate, authorize }       from '../../middleware/auth.js';
import { runAgent }                      from './agents.service.js';
import { AGENT_CONFIGS }                 from './agent.configs.js';

const router = Router();
router.use(authenticate);

const wrap = (type) => async (req, res) => {
  try {
    const report = await runAgent(type);
    res.json(report);
  } catch (e) {
    console.error(`[Agent:${type}] error:`, e.message);
    res.status(500).json({ error: e.message });
  }
};

// ── Agent endpoints ───────────────────────────────────────────────────────────
router.post('/grants/run',      authorize('grants'),      wrap('grants'));
router.post('/procurement/run', authorize('procurement'), wrap('procurement'));
router.post('/operations/run',  authorize('assets'),      wrap('operations'));
router.post('/executive/run',   authorize('executive'),   wrap('executive'));

// ── Metadata endpoint — returns agent card info without running ───────────────
router.get('/catalog', authenticate, (req, res) => {
  const catalog = Object.entries(AGENT_CONFIGS).map(([type, cfg]) => ({
    type,
    name:        cfg.name,
    icon:        cfg.icon,
    color:       cfg.color,
    description: cfg.description,
  }));
  res.json(catalog);
});

export default router;
