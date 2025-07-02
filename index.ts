import dotenv from 'dotenv';
dotenv.config();

import express, { Application } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import tugasRoutes from './routes/tugasRoutes';

const app: Application = express();
app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api/tugas', tugasRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend berjalan di http://localhost:${PORT}`);
});