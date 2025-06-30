import express, { Request, Response } from 'express';
import { registerUser, getAllUsers, getUserById, updateUser, deleteUser, loginUser } from '../services/authServices';

const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
  const { name, email, password, role, wilayah } = req.body;
  try {
    const result = await registerUser(name, email, password, role, wilayah);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
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