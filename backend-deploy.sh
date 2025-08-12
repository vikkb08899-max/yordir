#!/bin/bash

# Скрипт деплоя только бэкенда TRX Exchange
set -e

echo "🚀 Деплой бэкенда TRX Exchange..."

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Проверяем наличие .env файла
if [ ! -f ".env" ]; then
    error "Файл .env не найден! Создайте его с необходимыми переменными."
fi

# Проверяем Node.js
if ! command -v node &> /dev/null; then
    error "Node.js не установлен. Установите Node.js 18+"
fi

# Проверяем PM2
if ! command -v pm2 &> /dev/null; then
    log "Устанавливаем PM2..."
    npm install -g pm2
fi

# Устанавливаем зависимости
log "Устанавливаем зависимости..."
npm install --production

# Останавливаем старый процесс
log "Останавливаем старый процесс..."
pm2 stop tron-exchange-backend || true
pm2 delete tron-exchange-backend || true

# Запускаем новый процесс
log "Запускаем бэкенд..."
pm2 start server.js --name "tron-exchange-backend" --env production

# Сохраняем конфигурацию PM2
pm2 save
pm2 startup

# Проверяем статус
log "Проверяем статус..."
sleep 5

if pm2 list | grep -q "tron-exchange-backend.*online"; then
    log "✅ Бэкенд успешно запущен!"
    log "📊 Логи: pm2 logs tron-exchange-backend"
    log "🔧 Управление: pm2 [start|stop|restart] tron-exchange-backend"
    log "📍 API доступен на порту 3000"
else
    error "❌ Бэкенд не запустился. Проверьте логи: pm2 logs"
fi

echo ""
echo "=================================================="
echo "🎉 Бэкенд TRX Exchange развернут!"
echo "=================================================="
echo "📍 API: http://your-server-ip:3000"
echo "📊 Логи: pm2 logs tron-exchange-backend"
echo "🔧 Управление: pm2 [start|stop|restart] tron-exchange-backend"
echo "📁 Конфигурация: pm2 show tron-exchange-backend"
echo "==================================================" 