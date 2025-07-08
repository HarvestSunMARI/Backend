import { registerUser, getAllUsers, getUserById, updateUser, deleteUser, loginUser } from '../services/authServices';
import { createClient } from '@supabase/supabase-js';
import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);


// Register user (single)
router.post('/register', async (req, res) => {
  const { name, email, password, role, wilayah } = req.body;
  try {
    const result = await registerUser(name, email, password, role, wilayah);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Register many users (bulk insert)
router.post('/register-many', async (req, res) => {
  if (!Array.isArray(req.body)) {
    res.status(400).json({ error: 'Request body harus berupa array user.' });
    return;
  }
  const results = [];
  for (const user of req.body) {
    const { name, email, password, role, wilayah } = user;
    try {
      const result = await registerUser(name, email, password, role, wilayah);
      results.push({ success: true, result });
    } catch (err: any) {
      results.push({ success: false, error: err.message, email });
    }
  }
  res.json(results);
});


// Login user
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  // Cek user di database
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) {
    return res.status(401).json({ error: 'Email tidak ditemukan' });
  }
  // Bandingkan password dengan hash
  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Password salah' });
  }
  // Buat token JWT
  const access_token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '1d' }
  );
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      wilayah: user.wilayah
    },
    access_token
  });
});


// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

//Get user by id
router.get('/users/:id', async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    const updated = await updateUser(req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const deleted = await deleteUser(req.params.id);
    res.json(deleted);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;