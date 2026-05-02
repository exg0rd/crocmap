import { Router } from 'express';
import {
  uploadPhotos,
  getTripPhotos,
  deletePhoto,
  updatePhotoCaption,
} from '../controllers/photo.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Все маршруты требуют аутентификации
router.use(authenticateToken);

// Загрузка фото к командировке
// POST /api/trips/:id/photos
router.post('/:id/photos', uploadPhotos);

// Получение всех фото командировки
// GET /api/trips/:id/photos
router.get('/:id/photos', getTripPhotos);

// Удаление фото
// DELETE /api/trips/:id/photos/:photoId
router.delete('/:id/photos/:photoId', deletePhoto);

// Обновление описания фото
// PUT /api/trips/:id/photos/:photoId/caption
router.put('/:id/photos/:photoId/caption', updatePhotoCaption);

export default router;
