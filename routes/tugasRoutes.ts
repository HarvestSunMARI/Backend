import express from 'express';
import { createTugas, getAllTugas, getTugasById, updateTugas, deleteTugas } from '../services/tugasServices';
import { supabaseAuth } from '../middleware/supabaseAuth';

const router = express.Router();

// Create tugas
router.post('/tugas', supabaseAuth, async (req, res) => {
  try {
    const token = (req as any).supabaseToken;
    const tugas = await createTugas(req.body, token);
    res.json(tugas);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get all tugas
router.get('/tugas', supabaseAuth, async (req, res) => {
  try {
    const token = (req as any).supabaseToken;
    const tugas = await getAllTugas(token);
    res.json(tugas);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get tugas by id
router.get('/tugas/:id', supabaseAuth, async (req, res) => {
  try {
    const token = (req as any).supabaseToken;
    const tugas = await getTugasById(req.params.id, token);
    res.json(tugas);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update tugas
router.put('/tugas/:id', supabaseAuth, async (req, res) => {
  try {
    const token = (req as any).supabaseToken;
    const tugas = await updateTugas(req.params.id, req.body, token);
    res.json(tugas);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Delete tugas
router.delete('/tugas/:id', supabaseAuth, async (req, res) => {
  try {
    const token = (req as any).supabaseToken;
    const result = await deleteTugas(req.params.id, token);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router; 