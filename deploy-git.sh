#!/bin/bash

# Git-based деплой на сервер
# Использование: ./deploy-git.sh [frontend|backend|all]

set -e

SERVER_IP="91.219.237.178"
SERVER_USER="root"
PROJECT_PATH="/home/projtron01"
DOMAIN="cryptoxchange.click"

echo "🚀 Начинаем Git-based деплой..."

# Функция для деплоя фронтенда
deploy_frontend() {
    echo "📦 Собираем фронтенд..."
    npm run build
    
    echo "📤 Копируем фронтенд на сервер..."
    scp -o PubkeyAuthentication=no -r dist/* $SERVER_USER@$SERVER_IP:/var/www/html/
    
    echo "✅ Фронтенд задеплоен!"
}

# Функция для деплоя бекенда через Git
deploy_backend() {
    echo "📤 Обновляем бекенд на сервере через Git..."
    ssh -o PubkeyAuthentication=no $SERVER_USER@$SERVER_IP << 'EOF'
        cd /home/projtron01
        
        # Обновляем код из Git
        git pull origin main
        
        # Устанавливаем зависимости (только если package.json изменился)
        cd backend
        npm install
        
        # Перезапускаем бекенд
        if pm2 list | grep -q "exchange-backend"; then
            pm2 restart exchange-backend
        else
            pm2 start server.js --name "exchange-backend"
        fi
        
        echo "✅ Бекенд обновлен через Git!"
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

echo "🎉 Git-based деплой завершен!" 