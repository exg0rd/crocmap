# Примеры использования API

## Базовый URL
```
http://localhost:3001/api
```

## Аутентификация

### Регистрация пользователя
```bash
POST /auth/register
Content-Type: application/json

{
  "fullName": "Иванов Иван Иванович",
  "password": "password123"
}
```

### Вход в систему
```bash
POST /auth/login
Content-Type: application/json

{
  "fullName": "Иванов Иван Иванович",
  "password": "password123"
}
```

Ответ:
```json
{
  "message": "Вход выполнен успешно",
  "user": {
    "id": "clxyz...",
    "fullName": "Иванов Иван Иванович",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Командировки

Все запросы к командировкам требуют авторизации. Добавьте заголовок:
```
Authorization: Bearer <ваш_токен>
```

### Создание командировки
```bash
POST /trips
Content-Type: application/json

{
  "city": "Москва",
  "arrivalDate": "2024-01-20T10:00:00.000Z",
  "description": "Встреча с клиентом",
  "latitude": 55.7558,
  "longitude": 37.6173
}
```

### Получение всех командировок
```bash
GET /trips
```

### Получение командировок с фильтрами
```bash
GET /trips?city=Москва&startDate=2024-01-01&endDate=2024-01-31
```

Параметры:
- `city` - фильтр по городу
- `userId` - фильтр по ID пользователя
- `startDate` - дата начала периода (ISO формат)
- `endDate` - дата окончания периода (ISO формат)

### Получение моих командировок
```bash
GET /trips/my
```

### Обновление командировки
```bash
PUT /trips/:id
Content-Type: application/json

{
  "city": "Санкт-Петербург",
  "arrivalDate": "2024-01-25T12:00:00.000Z",
  "description": "Обновленное описание"
}
```

### Удаление командировки
```bash
DELETE /trips/:id
```

### Получение списка городов
```bash
GET /trips/cities
```

## Пользователи

### Получение списка пользователей
```bash
GET /auth/users
```

## Примеры использования с curl

### Регистрация
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Петров Петр Петрович","password":"secret123"}'
```

### Вход
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Петров Петр Петрович","password":"secret123"}'
```

### Создание командировки
```bash
curl -X POST http://localhost:3001/api/trips \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{"city":"Новосибирск","arrivalDate":"2024-02-01T14:00:00.000Z","description":"Технический аудит"}'
```

### Получение командировок
```bash
curl -X GET http://localhost:3001/api/trips \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Примеры использования с JavaScript

```javascript
// Конфигурация API
const API_URL = 'http://localhost:3001/api';
let token = 'ваш_токен';

// Создание командировки
async function createTrip(tripData) {
  const response = await fetch(`${API_URL}/trips`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(tripData)
  });
  
  return await response.json();
}

// Получение командировок с фильтрами
async function getTrips(filters = {}) {
  const params = new URLSearchParams(filters);
  const response = await fetch(`${API_URL}/trips?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
}

// Пример использования
const trip = await createTrip({
  city: 'Екатеринбург',
  arrivalDate: new Date().toISOString(),
  description: 'Презентация продукта'
});

const filteredTrips = await getTrips({
  city: 'Екатеринбург',
  startDate: '2024-01-01'
});
```

## Ошибки API

### Коды ошибок
- `400` - Неверные данные запроса
- `401` - Требуется авторизация
- `403` - Недействительный токен
- `404` - Ресурс не найден
- `500` - Внутренняя ошибка сервера

### Пример ошибки
```json
{
  "error": "Неверные учетные данные"
}
```