# Быстрый старт

## Запуск за 5 минут

### Вариант 1: Docker (рекомендуется)

```bash
# 1. Клонировать или скопировать проект
git clone <репозиторий>
cd business-trips-tracker

# 2. Запустить приложение
./start.sh
```

Или вручную:
```bash
docker-compose up --build
```

### Вариант 2: Локальная установка

```bash
# 1. Установить зависимости
npm run install-all

# 2. Настроить базу данных
cd backend
echo "DATABASE_URL=postgresql://admin:admin123@localhost:5432/businesstrips" > .env
echo "JWT_SECRET=your-secret-key" >> .env
echo "PORT=3001" >> .env

# 3. Запустить PostgreSQL
# Убедитесь, что PostgreSQL запущен на порту 5432

# 4. Запустить миграции
npx prisma migrate dev

# 5. Запустить приложение
npm run dev
```

## Доступ к приложению

После запуска приложение будет доступно:

- **Фронтенд**: http://localhost:3000
- **Бэкенд API**: http://localhost:3001
- **База данных**: localhost:5432

## Первые шаги

1. **Откройте браузер** и перейдите на http://localhost:3000
2. **Зарегистрируйтесь** как первый пользователь
3. **Войдите** в систему
4. **Добавьте первую командировку** через кнопку "+ Добавить командировку"
5. **Посмотрите** как командировка отображается на карте

## Тестовые данные

### Создание тестовых пользователей
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Иванов Иван Иванович","password":"password123"}'

curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Петров Петр Петрович","password":"password123"}'
```

### Создание тестовых командировок
```bash
# Получите токен после входа
TOKEN="ваш_токен"

curl -X POST http://localhost:3001/api/trips \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"city":"Москва","arrivalDate":"2024-01-15T10:00:00.000Z","description":"Встреча с клиентом"}'

curl -X POST http://localhost:3001/api/trips \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"city":"Санкт-Петербург","arrivalDate":"2024-01-20T14:00:00.000Z","description":"Конференция"}'
```

## Устранение частых проблем

### Порт уже используется
```bash
# Проверить занятые порты
sudo lsof -i :3000
sudo lsof -i :3001
sudo lsof -i :5432

# Остановить процессы или изменить порты в docker-compose.yml
```

### Ошибка подключения к базе данных
```bash
# Проверить, запущен ли PostgreSQL
sudo systemctl status postgresql

# Перезапустить контейнеры
docker-compose down
docker-compose up --build
```

### Ошибки с картой Leaflet
Убедитесь, что в `frontend/src/index.css` есть:
```css
@import '~leaflet/dist/leaflet.css';
```

### Ошибки TypeScript
```bash
# Переустановить зависимости
cd frontend && npm install
cd ../backend && npm install
```

## Дальнейшие шаги

1. **Настройте** переменные окружения для продакшена
2. **Добавьте SSL** сертификат
3. **Настройте резервное копирование**
4. **Добавьте мониторинг**
5. **Реализуйте дополнительные фичи** (загрузка фото и т.д.)

## Получение помощи

Если у вас возникли проблемы:

1. Проверьте логи: `docker-compose logs`
2. Посмотрите документацию в папке проекта
3. Создайте issue в репозитории проекта

## Следующие шаги после запуска

### Для разработки
1. Изучите структуру проекта
2. Добавьте новые фичи
3. Напишите тесты
4. Настройте CI/CD

### Для продакшена
1. Измените пароли по умолчанию
2. Настройте SSL
3. Настройте мониторинг
4. Настройте резервное копирование

### Для команды
1. Добавьте всех сотрудников
2. Настройте роли и права доступа
3. Проведите обучение
4. Соберите обратную связь