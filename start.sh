#!/bin/bash

echo "Запуск приложения для отслеживания командировок..."

# Проверка наличия Docker и Docker Compose
if ! command -v docker &> /dev/null; then
    echo "Ошибка: Docker не установлен"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Ошибка: Docker Compose не установлен"
    exit 1
fi

echo "1. Сборка и запуск контейнеров..."
docker-compose up --build -d

echo "2. Ожидание запуска сервисов..."
sleep 10

echo "3. Проверка статуса сервисов..."
docker-compose ps

echo "4. Приложение запущено!"
echo "   - Фронтенд: http://localhost:3000"
echo "   - Бэкенд API: http://localhost:3001"
echo "   - База данных: localhost:5432"
echo ""
echo "5. Для остановки выполните: docker-compose down"