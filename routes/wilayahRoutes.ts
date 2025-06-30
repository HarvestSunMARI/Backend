import express, { Request, Response, NextFunction } from 'express';
import {
  getWilayahPenyuluh,
  addWilayahPenyuluh,
  removeWilayahPenyuluh,
  getKonsultanByWilayah,
  getPenyuluhByWilayah,
  WilayahPenyuluhData
} from '../services/wilayahServices';

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
  next();
};

// Middleware untuk mendapatkan user ID dari token
const getUserFromToken = (req: Request, res: Response, next: NextFunction): void => {
  const userId = req.headers['user-id'] as string || req.body.user_id;
  if (!userId) {
    res.status(401).json({ error: 'User ID tidak ditemukan' });
    return;
  }
  req.userId = userId;
  next();
};

// GET /api/wilayah/penyuluh - Dapatkan wilayah yang dibawahi penyuluh
router.get('/penyuluh', verifyToken, getUserFromToken, async (req, res): Promise<void> => {
  try {
    const wilayah = await getWilayahPenyuluh(req.userId!);
    res.json(wilayah);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/wilayah/penyuluh - Tambah wilayah untuk penyuluh
router.post('/penyuluh', verifyToken, getUserFromToken, async (req, res): Promise<void> => {
  try {
    const { wilayah } = req.body;
    
    if (!wilayah || wilayah.trim() === '') {
      res.status(400).json({ error: 'Wilayah harus diisi' });
      return;
    }

    const wilayahData: WilayahPenyuluhData = {
      penyuluh_id: req.userId!,
      wilayah: wilayah.trim()
    };

    const newWilayah = await addWilayahPenyuluh(wilayahData);
    res.status(201).json({
      message: 'Wilayah berhasil ditambahkan',
      wilayah: newWilayah
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/wilayah/penyuluh/:wilayah - Hapus wilayah dari penyuluh
router.delete('/penyuluh/:wilayah', verifyToken, getUserFromToken, async (req, res): Promise<void> => {
  try {
    const result = await removeWilayahPenyuluh(req.userId!, req.params.wilayah);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/wilayah/:wilayah/konsultan - Dapatkan konsultan berdasarkan wilayah
router.get('/:wilayah/konsultan', verifyToken, async (req, res): Promise<void> => {
  try {
    const konsultan = await getKonsultanByWilayah(req.params.wilayah);
    res.json(konsultan);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/wilayah/:wilayah/penyuluh - Dapatkan penyuluh berdasarkan wilayah
router.get('/:wilayah/penyuluh', verifyToken, async (req, res): Promise<void> => {
  try {
    const penyuluh = await getPenyuluhByWilayah(req.params.wilayah);
    res.json(penyuluh);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router; 