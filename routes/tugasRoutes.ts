import express, { Request, Response, NextFunction } from 'express';
import {
  getKonsultanList,
  createTugas,
  getTugasByPenyuluh,
  getTugasByKonsultan,
  getTugasById,
  updateTugas,
  updateTugasStatus,
  deleteTugas,
  getTugasRiwayat,
  getTugasKomentar,
  addTugasKomentar,
  TugasData
} from '../services/tugasServices';

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
  const userId = req.headers['user-id'] as string || req.body.user_id;
  if (!userId) {
    res.status(401).json({ error: 'User ID tidak ditemukan' });
    return;
  }
  req.userId = userId;
  next();
};

// GET /api/tugas/konsultan-list - Dapatkan daftar konsultan untuk dropdown
router.get('/konsultan-list', verifyToken, getUserFromToken, async (req, res): Promise<void> => {
  try {
    const konsultanList = await getKonsultanList(req.userId!);
    res.json(konsultanList);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tugas - Buat tugas baru (oleh penyuluh)
router.post('/', verifyToken, getUserFromToken, async (req, res): Promise<void> => {
  try {
    const { judul, deskripsi, konsultan_id, tanggal_mulai, deadline, lampiran_url, jenis } = req.body;
    
    // Validasi input
    if (!judul || !konsultan_id || !deadline) {
      res.status(400).json({ 
        error: 'Judul, konsultan, dan deadline harus diisi' 
      });
      return;
    }

    const tugasData: TugasData = {
      judul,
      deskripsi,
      konsultan_id,
      tanggal_mulai,
      deadline,
      lampiran_url,
      jenis
    };

    const newTugas = await createTugas(tugasData, req.userId!);
    res.status(201).json({
      message: 'Tugas berhasil dibuat',
      tugas: newTugas
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/tugas/penyuluh - Dapatkan tugas yang dibuat oleh penyuluh
router.get('/penyuluh', verifyToken, getUserFromToken, async (req, res): Promise<void> => {
  try {
    const tugas = await getTugasByPenyuluh(req.userId!);
    res.json(tugas);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tugas/konsultan - Dapatkan tugas yang ditugaskan ke konsultan
router.get('/konsultan', verifyToken, getUserFromToken, async (req, res): Promise<void> => {
  try {
    const tugas = await getTugasByKonsultan(req.userId!);
    res.json(tugas);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tugas/:id - Dapatkan detail tugas berdasarkan ID
router.get('/:id', verifyToken, async (req, res): Promise<void> => {
  try {
    const tugas = await getTugasById(req.params.id);
    res.json(tugas);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

// PUT /api/tugas/:id - Update tugas (oleh penyuluh yang membuatnya)
router.put('/:id', verifyToken, getUserFromToken, async (req, res): Promise<void> => {
  try {
    const { judul, deskripsi, konsultan_id, tanggal_mulai, deadline, lampiran_url } = req.body;
    
    const updateData: Partial<TugasData> = {};
    if (judul) updateData.judul = judul;
    if (deskripsi !== undefined) updateData.deskripsi = deskripsi;
    if (konsultan_id) updateData.konsultan_id = konsultan_id;
    if (tanggal_mulai !== undefined) updateData.tanggal_mulai = tanggal_mulai;
    if (deadline) updateData.deadline = deadline;
    if (lampiran_url !== undefined) updateData.lampiran_url = lampiran_url;

    const updatedTugas = await updateTugas(req.params.id, updateData, req.userId!);
    res.json({
      message: 'Tugas berhasil diupdate',
      tugas: updatedTugas
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/tugas/:id/status - Update status tugas (oleh konsultan)
router.patch('/:id/status', verifyToken, getUserFromToken, async (req, res): Promise<void> => {
  try {
    const { status } = req.body;
    
    if (!status || !['Belum Dikerjakan', 'Sedang Berlangsung', 'Selesai'].includes(status)) {
      res.status(400).json({ 
        error: 'Status harus salah satu dari: Belum Dikerjakan, Sedang Berlangsung, Selesai' 
      });
      return;
    }

    const result = await updateTugasStatus(req.params.id, status, req.userId!);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/tugas/:id - Hapus tugas (oleh penyuluh yang membuatnya)
router.delete('/:id', verifyToken, getUserFromToken, async (req, res): Promise<void> => {
  try {
    const result = await deleteTugas(req.params.id, req.userId!);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/tugas/:id/riwayat - Dapatkan riwayat perubahan tugas
router.get('/:id/riwayat', verifyToken, async (req, res): Promise<void> => {
  try {
    const riwayat = await getTugasRiwayat(req.params.id);
    res.json(riwayat);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tugas/:id/komentar - Dapatkan komentar tugas
router.get('/:id/komentar', verifyToken, async (req, res): Promise<void> => {
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
    
    if (!komentar || komentar.trim() === '') {
      res.status(400).json({ 
        error: 'Komentar tidak boleh kosong' 
      });
      return;
    }

    const newKomentar = await addTugasKomentar(req.params.id, komentar.trim(), req.userId!);
    res.status(201).json({
      message: 'Komentar berhasil ditambahkan',
      komentar: newKomentar
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router; 