#!/bin/bash

# Простой скрипт для обновления сервера
# Использование: ./update-server.sh

echo "🔄 Обновляем сервер..."

# Подключаемся к серверу и обновляем
ssh -o PubkeyAuthentication=no root@91.219.237.178 << 'EOF'
    echo "📥 Подтягиваем изменения из Git..."
    cd /home/projtron01
    
    # Подтягиваем изменения
    git fetch origin
    git reset --hard origin/main
    
    echo "📦 Обновляем зависимости..."
    cd backend
    npm install
    
    echo "🔄 Перезапускаем бекенд..."
    if pm2 list | grep -q "exchange-backend"; then
        pm2 restart exchange-backend
        echo "✅ Бекенд обновлен и перезапущен"
    else
        pm2 start server.js --name "exchange-backend"
        echo "✅ Бекенд запущен"
    fi
    
    echo "📊 Статус PM2:"
    pm2 status
EOF

echo "✅ Сервер обновлен!" 