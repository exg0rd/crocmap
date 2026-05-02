# Дополнительная фича: Загрузка фото к командировкам

## Описание
Возможность добавлять фотографии к командировкам с описаниями.

## Реализация

### 1. Расширение модели базы данных

Уже реализовано в `backend/prisma/schema.prisma`:
```prisma
model Photo {
  id        String   @id @default(cuid())
  tripId    String
  filename  String
  url       String
  caption   String?
  createdAt DateTime @default(now())
  
  trip      Trip     @relation(fields: [tripId], references: [id], onDelete: Cascade)
}
```

### 2. API для работы с фото

#### Загрузка фото
```bash
POST /trips/:id/photos
Content-Type: multipart/form-data

file: <файл>
caption: Описание фото
```

#### Получение фото командировки
```bash
GET /trips/:id/photos
```

#### Удаление фото
```bash
DELETE /trips/:id/photos/:photoId
```

### 3. Хранение файлов

**Вариант 1: Локальное хранение**
```javascript
// Использование multer для загрузки файлов
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
```

**Вариант 2: Облачное хранилище (рекомендуется для продакшена)**
- AWS S3
- Google Cloud Storage
- Azure Blob Storage

### 4. Интеграция с фронтендом

#### Компонент загрузки фото
```jsx
const PhotoUploader = ({ tripId, onUploadComplete }) => {
  const [files, setFiles] = useState([]);
  const [captions, setCaptions] = useState({});
  
  const handleUpload = async () => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('files', file);
      formData.append(`captions[${index}]`, captions[index] || '');
    });
    
    await api.post(`/trips/${tripId}/photos`, formData);
    onUploadComplete();
  };
  
  return (
    <div>
      <input type="file" multiple onChange={handleFileSelect} />
      {/* Превью и поля для описаний */}
      <button onClick={handleUpload}>Загрузить</button>
    </div>
  );
};
```

#### Галерея фото
```jsx
const PhotoGallery = ({ tripId }) => {
  const [photos, setPhotos] = useState([]);
  
  useEffect(() => {
    loadPhotos();
  }, [tripId]);
  
  const loadPhotos = async () => {
    const data = await api.get(`/trips/${tripId}/photos`);
    setPhotos(data);
  };
  
  return (
    <div className="photo-gallery">
      {photos.map(photo => (
        <div key={photo.id} className="photo-item">
          <img src={photo.url} alt={photo.caption} />
          <p>{photo.caption}</p>
          <button onClick={() => deletePhoto(photo.id)}>Удалить</button>
        </div>
      ))}
    </div>
  );
};
```

### 5. Безопасность

#### Проверка файлов
```javascript
const fileFilter = (req, file, cb) => {
  // Разрешенные типы файлов
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Недопустимый тип файла'), false);
  }
};
```

#### Ограничение размера
```javascript
const limits = {
  fileSize: 5 * 1024 * 1024, // 5MB
  files: 10 // максимум 10 файлов за раз
};
```

### 6. Производительность

#### Оптимизация изображений
- Использовать библиотеки для сжатия (sharp, jimp)
- Генерировать превью разных размеров
- Использовать lazy loading для галереи

#### Кэширование
- Кэшировать превью изображений
- Использовать CDN для раздачи статики

### 7. Мониторинг

#### Логирование
```javascript
// Логирование загрузок
console.log(`Photo uploaded: ${filename}, size: ${size}, user: ${userId}`);
```

#### Метрики
- Количество загруженных фото
- Средний размер фото
- Популярные типы файлов

### 8. Резервное копирование

#### Регулярное копирование
```bash
# Копирование загруженных файлов
tar -czf backups/photos-$(date +%Y%m%d).tar.gz uploads/
```

#### Интеграция с облачным хранилищем
- Автоматическое резервное копирование в S3
- Версионирование файлов

## Приоритет реализации

1. **Базовый функционал** (высокий приоритет):
   - Загрузка одного фото
   - Просмотр фото в галерее
   - Удаление фото

2. **Расширенный функционал** (средний приоритет):
   - Множественная загрузка
   - Предпросмотр перед загрузкой
   - Обрезка и редактирование фото

3. **Оптимизация** (низкий приоритет):
   - Сжатие изображений
   - Ленивая загрузка
   - CDN интеграция

## Пример кода для реализации

### Backend контроллер
```typescript
export const uploadPhotos = [
  upload.array('files', 10),
  async (req: AuthRequest, res: Response) => {
    try {
      const tripId = req.params.id;
      const userId = req.userId!;
      
      // Проверка прав доступа
      const trip = await TripModel.findById(tripId);
      if (!trip || trip.userId !== userId) {
        return res.status(403).json({ error: 'Нет доступа' });
      }
      
      const files = req.files as Express.Multer.File[];
      const captions = req.body.captions || [];
      
      const photos = await Promise.all(
        files.map(async (file, index) => {
          return await PhotoModel.create({
            tripId,
            filename: file.filename,
            url: `/uploads/${file.filename}`,
            caption: captions[index] || null,
          });
        })
      );
      
      res.status(201).json(photos);
    } catch (error) {
      res.status(500).json({ error: 'Ошибка при загрузке фото' });
    }
  }
];
```

### Frontend компонент
```typescript
const TripDetailPage: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const handlePhotoUpload = async (files: FileList) => {
    setIsUploading(true);
    const formData = new FormData();
    
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });
    
    try {
      const response = await tripService.uploadPhotos(tripId, formData);
      setPhotos([...photos, ...response]);
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div>
      <PhotoGallery photos={photos} />
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handlePhotoUpload(e.target.files!)}
        disabled={isUploading}
      />
    </div>
  );
};
```