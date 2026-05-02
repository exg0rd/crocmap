# Инструкция по развертыванию

## Требования

- Docker и Docker Compose
- 4 ГБ свободной оперативной памяти
- 2 ГБ свободного места на диске

## Быстрый запуск

```bash
# Дайте права на выполнение скрипта
chmod +x start.sh

# Запустите приложение
./start.sh
```

Или вручную:

```bash
docker-compose up --build
```

## Ручная установка (без Docker)

### 1. Установка зависимостей

```bash
# Установить Node.js (версия 18 или выше)
# Установить PostgreSQL

# Установить зависимости проекта
npm run install-all
```

### 2. Настройка базы данных

```bash
cd backend

# Создать файл .env с содержимым:
echo "DATABASE_URL=postgresql://admin:admin123@localhost:5432/businesstrips" > .env
echo "JWT_SECRET=your-super-secret-jwt-key-change-in-production" >> .env
echo "PORT=3001" >> .env

# Запустить миграции
npx prisma migrate dev
```

### 3. Запуск приложения

```bash
# В одной терминальной сессии (бэкенд)
cd backend
npm run dev

# В другой терминальной сессии (фронтенд)
cd frontend
npm start
```

## Настройка для продакшена

### 1. Настройка переменных окружения

Создайте файлы `.env` в папках `backend` и `frontend`:

**backend/.env:**
```
DATABASE_URL=postgresql://username:password@host:5432/database
JWT_SECRET=strong-secret-key-change-this
PORT=3001
NODE_ENV=production
```

**frontend/.env:**
```
REACT_APP_API_URL=http://your-domain.com:3001
```

### 2. Сборка для продакшена

```bash
# Собрать фронтенд
cd frontend
npm run build

# Собрать бэкенд
cd ../backend
npm run build
```

### 3. Запуск в Docker (продакшен)

```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

## Мониторинг

```bash
# Просмотр логов
docker-compose logs -f

# Проверка статуса контейнеров
docker-compose ps

# Остановка приложения
docker-compose down
```

## Резервное копирование базы данных

```bash
# Экспорт данных
docker exec -t postgres pg_dump -U admin businesstrips > backup.sql

# Импорт данных
cat backup.sql | docker exec -i postgres psql -U admin businesstrips
```

## Обновление приложения

```bash
# Остановить текущую версию
docker-compose down

# Получить обновленный код
git pull

# Пересобрать и запустить
docker-compose up --build -d
```

## Устранение неполадок

### Проблемы с базой данных

```bash
# Пересоздать базу данных
docker-compose down -v
docker-compose up --build
```

### Проблемы с портами

Если порты 3000, 3001 или 5432 заняты, измените их в `docker-compose.yml`.

### Проблемы с памятью

Увеличьте лимиты памяти Docker в настройках Docker Desktop или увеличьте swap.

### Проблемы с Leaflet картой

Убедитесь, что в `frontend/src/index.css` импортированы стили Leaflet:
```css
@import '~leaflet/dist/leaflet.css';
```