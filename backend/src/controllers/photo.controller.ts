import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth.middleware';
import { TripModel } from '../models/trip.model';
import { PhotoModel } from '../models/photo.model';
import { minioService } from '../services/minio.service';

// Middleware для загрузки файлов
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10, // максимум 10 файлов за раз
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Недопустимый тип файла. Разрешены только JPEG, PNG, GIF и WebP.'));
    }
  },
});

export const uploadPhotos = [
  upload.array('files', 10),
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const tripId = req.params.id;
      const captions = req.body.captions ? JSON.parse(req.body.captions) : [];

      // Проверка прав доступа к командировке
      const trip = await TripModel.findById(tripId);
      if (!trip || trip.userId !== userId) {
        return res.status(403).json({ error: 'Нет доступа к этой командировке' });
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'Файлы не загружены' });
      }

      const photos = await Promise.all(
        files.map(async (file, index) => {
          // Генерируем уникальное имя файла
          const timestamp = Date.now();
          const randomString = Math.random().toString(36).substring(2, 15);
          const extension = file.originalname.split('.').pop() || 'jpg';
          const objectName = `trips/${tripId}/${timestamp}_${randomString}.${extension}`;

          // Загружаем файл в Minio
          const url = await minioService.uploadFile(file, objectName);

          // Сохраняем информацию о фото в базе данных
          const photo = await PhotoModel.create({
            tripId,
            filename: `${timestamp}_${randomString}.${extension}`,
            url,
            caption: captions[index] || null,
          });

          return photo;
        })
      );

      res.status(201).json({
        message: 'Фото успешно загружены',
        photos,
      });
    } catch (error: any) {
      console.error('Upload photos error:', error);
      res.status(500).json({ 
        error: error.message || 'Ошибка при загрузке фото' 
      });
    }
  },
];

export const getTripPhotos = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const tripId = req.params.id;

    // Проверка прав доступа к командировке
    const trip = await TripModel.findById(tripId);
    if (!trip || trip.userId !== userId) {
      return res.status(403).json({ error: 'Нет доступа к этой командировке' });
    }

    const photos = await PhotoModel.findByTripId(tripId);

    res.json(photos);
  } catch (error) {
    console.error('Get trip photos error:', error);
    res.status(500).json({ error: 'Ошибка при получении фото' });
  }
};

export const deletePhoto = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const tripId = req.params.id;
    const photoId = req.params.photoId;

    // Проверка прав доступа к командировке
    const trip = await TripModel.findById(tripId);
    if (!trip || trip.userId !== userId) {
      return res.status(403).json({ error: 'Нет доступа к этой командировке' });
    }

    const photo = await PhotoModel.findById(photoId);
    if (!photo || photo.tripId !== tripId) {
      return res.status(404).json({ error: 'Фото не найдено' });
    }

    // Удаляем файл из Minio
    const objectName = `trips/${tripId}/${photo.filename}`;
    try {
      await minioService.deleteFile(objectName);
    } catch (error) {
      console.warn('Failed to delete file from Minio, but continuing with DB deletion:', error);
    }

    // Удаляем запись из базы данных
    await PhotoModel.delete(photoId, tripId);

    res.json({ message: 'Фото успешно удалено' });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ error: 'Ошибка при удалении фото' });
  }
};

export const updatePhotoCaption = [
  body('caption').optional().isString().trim(),
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.userId!;
      const tripId = req.params.id;
      const photoId = req.params.photoId;
      const { caption } = req.body;

      // Проверка прав доступа к командировке
      const trip = await TripModel.findById(tripId);
      if (!trip || trip.userId !== userId) {
        return res.status(403).json({ error: 'Нет доступа к этой командировке' });
      }

      const photo = await PhotoModel.updateCaption(photoId, caption || '');
      if (!photo) {
        return res.status(404).json({ error: 'Фото не найдено' });
      }

      res.json({
        message: 'Описание фото обновлено',
        photo,
      });
    } catch (error) {
      console.error('Update photo caption error:', error);
      res.status(500).json({ error: 'Ошибка при обновлении описания фото' });
    }
  },
];

export { upload };
