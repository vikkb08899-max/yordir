#!/bin/bash

# Скрипт для автоматического деплоя на сервер
# Использование: ./deploy.sh [frontend|backend|all]

set -e

SERVER_IP="91.219.237.178"
SERVER_USER="root"
PROJECT_PATH="/home/projtron01"
DOMAIN="cryptoxchange.click"

echo "🚀 Начинаем деплой..."

# Функция для деплоя фронтенда
deploy_frontend() {
    echo "📦 Собираем фронтенд..."
    npm run build
    
    echo "📤 Копируем фронтенд на сервер..."
    scp -o PubkeyAuthentication=no -r dist/* $SERVER_USER@$SERVER_IP:/var/www/html/
    
    echo "✅ Фронтенд задеплоен!"
}

# Функция для деплоя бекенда
deploy_backend() {
    echo "📤 Копируем бекенд на сервер..."
    ssh -o PubkeyAuthentication=no $SERVER_USER@$SERVER_IP "mkdir -p $PROJECT_PATH"
    scp -o PubkeyAuthentication=no -r backend/ $SERVER_USER@$SERVER_IP:$PROJECT_PATH/
    
    echo "🔧 Обновляем бекенд на сервере..."
    ssh -o PubkeyAuthentication=no $SERVER_USER@$SERVER_IP << 'EOF'
        # Создаем папку если не существует
        mkdir -p /home/projtron01
        
        cd /home/projtron01/backend
        npm install
        
        # Проверяем статус PM2
        if pm2 list | grep -q "exchange-backend"; then
            pm2 restart exchange-backend
        else
            pm2 start server.js --name "exchange-backend"
        fi
        
        echo "✅ Бекенд обновлен и перезапущен!"
EOF
}

# Функция для полного деплоя
deploy_all() {
    deploy_frontend
    deploy_backend
}

# Проверяем аргументы
case "${1:-all}" in
    "frontend")
        deploy_frontend
        ;;
    "backend")
        deploy_backend
        ;;
    "all")
        deploy_all
        ;;
    *)
        echo "❌ Неизвестный аргумент. Используйте: frontend, backend или all"
        exit 1
        ;;
esac

echo "🎉 Деплой завершен!" 