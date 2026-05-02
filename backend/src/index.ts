import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import tripRoutes from './routes/trip.routes';
import photoRoutes from './routes/photo.routes';
import { authenticateToken } from './middleware/auth.middleware';
import { minioService } from './services/minio.service';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Инициализация Minio сервиса
minioService.initialize();

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/trips', authenticateToken, tripRoutes);
app.use('/api/trips', photoRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});