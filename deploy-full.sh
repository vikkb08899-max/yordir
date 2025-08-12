#!/bin/bash

# Полный деплой: фронтенд + уведомление сервера
# Использование: ./deploy-full.sh

set -e

echo "🚀 Полный деплой проекта..."

# Деплоим фронтенд
echo "📦 Деплой фронтенда..."
./deploy-frontend.sh

# Уведомляем сервер о необходимости обновления бекенда
echo "📡 Уведомляем сервер..."
SERVER_IP="91.219.237.178"
SERVER_USER="root"

ssh -o PubkeyAuthentication=no $SERVER_USER@$SERVER_IP << 'EOF'
    echo "🔄 Принудительное обновление бекенда..."
    cd /home/projtron01
    
    # Подтягиваем изменения из Git
    git fetch origin
    git reset --hard origin/main
    
    # Обновляем зависимости
    cd backend
    npm install
    
    # Перезапускаем бекенд
    if pm2 list | grep -q "exchange-backend"; then
        pm2 restart exchange-backend
        echo "✅ Бекенд обновлен и перезапущен"
    else
        pm2 start server.js --name "exchange-backend"
        echo "✅ Бекенд запущен"
    fi
EOF

echo "✅ Полный деплой завершен!" 