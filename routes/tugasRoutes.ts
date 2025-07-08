import express, { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
// import { verifyToken, getUserFromToken } from '../middleware/auth';
import {
  createTugas,
  getTugasByPenyuluh,
  getTugasByGapoktan,
  getTugasById,
  updateTugas,
  updateTugasStatus,
  deleteTugas,
  getTugasRiwayat,
  getTugasKomentar,
  addTugasKomentar,
  getGapoktanList
} from '../services/tugasServices';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

// Extend Request interface to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

const router = express.Router();

// Middleware untuk verifikasi token (sederhana)
const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ error: 'Token tidak ditemukan' });
    return;
  }
  // Di sini bisa ditambahkan verifikasi JWT token dengan Supabase
  // Untuk sementara, kita asumsikan token valid
  next();
};

// Middleware untuk mendapatkan user ID dari token
const getUserFromToken = (req: Request, res: Response, next: NextFunction): void => {
  // Ambil userId dari header, query, atau body (jika ada)
  const userId = req.headers['user-id'] as string || req.query.user_id as string || (req.body && req.body.user_id);
  if (!userId) {
    res.status(401).json({ error: 'User ID tidak ditemukan' });
    return;
  }
  req.userId = userId;
  next();
};

// GET /api/tugas/gapoktan-list - Dapatkan daftar gapoktan untuk dropdown
router.get('/gapoktan-list', verifyToken, getUserFromToken, async (req, res): Promise<void> => {
  try {
    const gapoktanList = await getGapoktanList(req.userId!);
    res.json(gapoktanList);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tugas - Buat tugas baru
router.post('/', verifyToken, getUserFromToken, async (req, res): Promise<void> => {
  try {
    const tugas = await createTugas(req.body, req.userId!);
    res.status(201).json(tugas);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tugas - Dapatkan tugas berdasarkan role user
router.get('/', verifyToken, getUserFromToken, async (req, res): Promise<void> => {
  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', req.userId!)
      .single();

    if (userError) throw new Error(userError.message);

    let tugas;
    if (user.role === 'penyuluh') {
      tugas = await getTugasByPenyuluh(req.userId!);
    } else if (user.role === 'gapoktan') {
      tugas = await getTugasByGapoktan(req.userId!);
    } else {
      throw new Error('Role tidak valid');
    }

    res.json(tugas);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tugas/:id - Dapatkan detail tugas
router.get('/:id', verifyToken, getUserFromToken, async (req, res): Promise<void> => {
  try {
    const tugas = await getTugasById(req.params.id);
    res.json(tugas);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/tugas/:id - Update tugas
router.put('/:id', verifyToken, getUserFromToken, async (req, res): Promise<void> => {
  try {
    const tugas = await updateTugas(req.params.id, req.body, req.userId!);
    res.json(tugas);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/tugas/:id/status - Update status tugas
router.put('/:id/status', verifyToken, getUserFromToken, async (req, res): Promise<void> => {
  try {
    const { status } = req.body;
    const tugas = await updateTugasStatus(req.params.id, status, req.userId!);
    res.json(tugas);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/tugas/:id - Hapus tugas
router.delete('/:id', verifyToken, getUserFromToken, async (req, res): Promise<void> => {
  try {
    const result = await deleteTugas(req.params.id, req.userId!);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tugas/:id/riwayat - Dapatkan riwayat tugas
router.get('/:id/riwayat', verifyToken, getUserFromToken, async (req, res): Promise<void> => {
  try {
    const riwayat = await getTugasRiwayat(req.params.id);
    res.json(riwayat);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tugas/:id/komentar - Dapatkan komentar tugas
router.get('/:id/komentar', verifyToken, getUserFromToken, async (req, res): Promise<void> => {
  try {
    const komentar = await getTugasKomentar(req.params.id);
    res.json(komentar);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tugas/:id/komentar - Tambah komentar tugas
router.post('/:id/komentar', verifyToken, getUserFromToken, async (req, res): Promise<void> => {
  try {
    const { komentar } = req.body;
    const result = await addTugasKomentar(req.params.id, komentar, req.userId!);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router; 