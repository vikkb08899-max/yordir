#!/bin/bash

# Быстрый деплой на Vercel без Git
set -e

echo "🚀 Деплой TRX Exchange на Vercel..."

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] $1${NC}"
}

# Проверяем Vercel CLI
if ! command -v vercel &> /dev/null; then
    warn "Vercel CLI не установлен. Устанавливаем..."
    npm install -g vercel
fi

# Проверяем авторизацию
if ! vercel whoami &> /dev/null; then
    warn "Необходимо войти в Vercel аккаунт"
    vercel login
fi

# Собираем проект
log "Собираем фронтенд..."
npm run build

# Проверяем что dist создался
if [ ! -d "dist" ]; then
    echo "❌ Папка dist не найдена. Проверьте сборку проекта."
    exit 1
fi

# Деплоим на Vercel
log "Деплоим на Vercel..."
vercel --prod --yes

log "✅ Деплой завершен!"
warn "📝 Не забудьте:"
warn "   1. Обновить VITE_API_URL в vercel.json на IP вашего сервера"
warn "   2. Добавить Vercel URL в CORS настройки бэкенда"
warn "   3. Перезапустить бэкенд: pm2 restart tron-exchange-backend"

echo ""
echo "🎉 Фронтенд развернут на Vercel!"
echo "📱 Откройте URL который показал Vercel для проверки" 