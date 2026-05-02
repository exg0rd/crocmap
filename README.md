# Business Trips Tracker

Веб-приложение для отслеживания командировок сотрудников на карте России с использованием OpenStreetMap.

## Функциональность

- **Карта**: OpenStreetMap с фокусом на Россию
- **Аутентификация**: Простая система логина по ФИО и паролю
- **Командировки**:
  - Добавление командировок (город, дата прилёта, описание)
  - Удаление командировок
  - Просмотр всех командировок на карте
- **Фильтры**:
  - По городу
  - По сотруднику (ФИО)
  - По диапазону дат
- **Визуализация**: Разноцветные кликабельные точки на карте
- **Дополнительно**: Возможность загрузки фото к командировкам

## Архитектура

- **Фронтенд**: React + TypeScript + Leaflet
- **Бэкенд**: Node.js + Express + TypeScript
- **База данных**: PostgreSQL
- **Аутентификация**: JWT токены

## Запуск

### Локально (разработка)

```bash
npm run install-all
npm run dev
```

### Docker

```bash
docker-compose up
```

Приложение будет доступно:
- Фронтенд: http://localhost:3000
- Бэкенд API: http://localhost:3001
- База данных: localhost:5432

## Структура проекта

```
├── frontend/          # React приложение
├── backend/           # Node.js API сервер
├── docker-compose.yml # Docker конфигурация
└── README.md          # Документация
```

## Переменные окружения

Создайте файл `.env` в папках `backend` и `frontend` при необходимости.

### Backend (.env)
```
DATABASE_URL=postgresql://admin:admin123@localhost:5432/businesstrips
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=3001
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:3001
```