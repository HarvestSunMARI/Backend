import express, { Request, Response } from 'express';
import { registerUser, getAllUsers, getUserById, updateUser, deleteUser, loginUser } from '../services/authServices';

const router = express.Router();

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

// Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await loginUser(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

export default router;