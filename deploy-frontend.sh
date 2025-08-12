#!/bin/bash

# Скрипт для деплоя только фронтенда
# Использование: ./deploy-frontend.sh

set -e

SERVER_IP="91.219.237.178"
SERVER_USER="root"

echo "🚀 Деплой фронтенда..."

# Собираем фронтенд
echo "📦 Собираем фронтенд..."
npm run build

# Копируем на сервер
echo "📤 Копируем фронтенд на сервер..."
scp -o PubkeyAuthentication=no -r dist/* $SERVER_USER@$SERVER_IP:/var/www/html/

echo "✅ Фронтенд задеплоен!" 