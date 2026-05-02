# Хостинг приложения

## Варианты хостинга

### 1. Docker на собственном сервере (рекомендуется)

#### Требования к серверу
- Linux (Ubuntu 20.04+ или Debian 11+)
- 2+ ядра CPU
- 4+ ГБ RAM
- 20+ ГБ SSD
- Статический IP адрес или домен

#### Установка
```bash
# 1. Установить Docker и Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt-get install docker-compose-plugin

# 2. Клонировать репозиторий
git clone <ваш-репозиторий>
cd business-trips-tracker

# 3. Настроить переменные окружения
cp backend/.env.example backend/.env
# Отредактировать backend/.env

# 4. Запустить приложение
docker-compose up --build -d

# 5. Настроить reverse proxy (Nginx)
sudo apt install nginx
```

#### Конфигурация Nginx
```nginx
# /etc/nginx/sites-available/business-trips
server {
    listen 80;
    server_name ваш-домен.ru;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Активировать конфигурацию
sudo ln -s /etc/nginx/sites-available/business-trips /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### SSL сертификат (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d ваш-домен.ru
```

### 2. Облачные платформы

#### AWS (Amazon Web Services)
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    # Использовать RDS вместо контейнера
    
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    # Развернуть на EC2 или ECS
    
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    # Развернуть на S3 + CloudFront
```

#### Google Cloud Platform
- **PostgreSQL**: Cloud SQL
- **Backend**: Cloud Run или Compute Engine
- **Frontend**: Cloud Storage + Cloud CDN

#### Microsoft Azure
- **PostgreSQL**: Azure Database for PostgreSQL
- **Backend**: Azure Container Instances или App Service
- **Frontend**: Azure Storage + CDN

### 3. Platform as a Service (PaaS)

#### Heroku
```bash
# Установить Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Создать приложение
heroku create business-trips-tracker

# Добавить базу данных
heroku addons:create heroku-postgresql:hobby-dev

# Развернуть
git push heroku main
```

#### Railway
```bash
# Установить Railway CLI
npm i -g @railway/cli

# Развернуть
railway up
```

### 4. Российские хостинг-провайдеры

#### Selectel
- **Контейнеры**: Selectel Cloud Containers
- **База данных**: Managed PostgreSQL
- **Объектное хранилище**: для загрузки фото

#### Timeweb Cloud
- **VPS**: с предустановленным Docker
- **База данных**: Managed PostgreSQL
- **Домен**: бесплатный домен .timeweb.ru

#### Reg.ru
- **VPS**: с поддержкой Docker
- **SSL**: бесплатные сертификаты
- **Техподдержка**: на русском языке

## Мониторинг и обслуживание

### Логирование
```bash
# Просмотр логов Docker
docker-compose logs -f

# Ротация логов
docker run --log-driver=json-file --log-opt max-size=10m --log-opt max-file=3
```

### Резервное копирование
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)

# Бэкап базы данных
docker exec postgres pg_dump -U admin businesstrips > backup_${DATE}.sql

# Бэкап загруженных файлов (если есть)
tar -czf uploads_${DATE}.tar.gz uploads/

# Загрузка в облако (опционально)
# aws s3 cp backup_${DATE}.sql s3://ваш-бакет/backups/
```

### Мониторинг ресурсов
```bash
# Использование CPU и памяти
docker stats

# Мониторинг сети
iftop -i eth0

# Мониторинг диска
df -h
```

### Обновление
```bash
#!/bin/bash
# update.sh
echo "Остановка текущей версии..."
docker-compose down

echo "Получение обновлений..."
git pull

echo "Пересборка образов..."
docker-compose build --no-cache

echo "Запуск новой версии..."
docker-compose up -d

echo "Проверка статуса..."
docker-compose ps
```

## Безопасность

### Рекомендации по безопасности
1. **Изменить пароли по умолчанию** в docker-compose.yml
2. **Использовать HTTPS** с валидным SSL сертификатом
3. **Ограничить доступ** к портам бэкенда
4. **Регулярно обновлять** зависимости
5. **Настроить брандмауэр**
6. **Вести журнал аудита**

### Настройка брандмауэра (UFW)
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow ssh
sudo ufw enable
```

## Масштабирование

### Вертикальное масштабирование
```yaml
# docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### Горизонтальное масштабирование
```yaml
# docker-compose.scale.yml
services:
  backend:
    image: business-trips-backend
    deploy:
      replicas: 3
      restart_policy:
        condition: on-failure
```

## Стоимость хостинга

### Бюджетные варианты (до 1000 руб/мес)
- **Timeweb Cloud**: VPS 2GB RAM, 2 CPU ~ 300 руб/мес
- **Reg.ru**: VPS 2GB RAM ~ 400 руб/мес
- **Selectel**: Cloud Server 2GB RAM ~ 500 руб/мес

### Профессиональные варианты (1000-5000 руб/мес)
- **AWS Lightsail**: 4GB RAM, 2 CPU ~ 1500 руб/мес
- **Google Cloud**: e2-small + Cloud SQL ~ 2000 руб/мес
- **Azure**: B2s + PostgreSQL ~ 2500 руб/мес

### Корпоративные варианты (5000+ руб/мес)
- Выделенные серверы
- Кластерная архитектура
- Геораспределение
- SLA 99.9%

## Рекомендации

### Для начала (тестирование)
- **Локальный Docker** для разработки
- **Heroku** или **Railway** для демо

### Для небольшой команды (5-20 человек)
- **VPS на Timeweb** или **Reg.ru**
- **Docker Compose**
- **Nginx + Let's Encrypt**

### Для корпоративного использования
- **AWS** или **Google Cloud**
- **Kubernetes** для оркестрации
- **Terraform** для инфраструктуры
- **CI/CD** пайплайн

## Контакты поддержки

### Российские провайдеры
- **Timeweb**: support@timeweb.ru, +7 (800) 333-07-17
- **Reg.ru**: support@reg.ru, +7 (495) 580-11-11
- **Selectel**: support@selectel.ru, +7 (800) 333-24-94

### Международные провайдеры
- **AWS**: aws.amazon.com/ru/support
- **Google Cloud**: cloud.google.com/support
- **Microsoft Azure**: azure.microsoft.com/ru-ru/support