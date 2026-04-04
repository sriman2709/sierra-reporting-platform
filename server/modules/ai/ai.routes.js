/**
 * ai.routes.js — POST /api/ai/query
 */
import { Router } from 'express';
import { askAI }  from './ai.service.js';

const router = Router();

router.post('/query', async (req, res) => {
  const { question } = req.body;
  if (!question || typeof question !== 'string' || !question.trim()) {
    return res.status(400).json({ error: 'question is required' });
  }
  try {
    const result = await askAI(question.trim());
    res.json(result);
  } catch (err) {
    console.error('[AI] query error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
