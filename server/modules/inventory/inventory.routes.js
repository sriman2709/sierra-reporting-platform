import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { InventoryService } from './inventory.service.js';

const router = Router();
const auth = [authenticate, authorize('inventory')];
const wrap = fn => async (req, res) => {
  try { res.json(await fn(req, res)); }
  catch (e) { res.status(500).json({ error: e.message }); }
};

router.get('/kpis',         ...auth, wrap(() => InventoryService.getKPIs()));
router.get('/items',        ...auth, wrap(() => InventoryService.getItems()));
router.get('/transactions', ...auth, wrap(() => InventoryService.getTransactions()));
router.get('/warehouses',   ...auth, wrap(() => InventoryService.getWarehouses()));
router.get('/alerts',       ...auth, wrap(() => InventoryService.getAlerts()));
router.get('/turnover',     ...auth, wrap(() => InventoryService.getTurnover()));

export default router;
