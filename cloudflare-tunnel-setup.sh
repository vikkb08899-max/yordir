#!/bin/bash

# Настройка Cloudflare Tunnel для HTTPS без домена
set -e

echo "☁️ Настройка Cloudflare Tunnel..."

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

log "Скачиваем Cloudflared..."
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

log "Авторизация в Cloudflare..."
warn "Сейчас откроется браузер для авторизации в Cloudflare"
warn "Если у вас нет аккаунта Cloudflare - создайте его (бесплатно)"
cloudflared tunnel login

log "Создаем туннель..."
TUNNEL_NAME="tron-exchange-$(date +%s)"
cloudflared tunnel create $TUNNEL_NAME

log "Настраиваем конфигурацию..."
TUNNEL_ID=$(cloudflared tunnel list | grep $TUNNEL_NAME | awk '{print $1}')

mkdir -p ~/.cloudflared
cat > ~/.cloudflared/config.yml << EOF
tunnel: $TUNNEL_ID
credentials-file: /home/$USER/.cloudflared/$TUNNEL_ID.json

ingress:
  - hostname: $TUNNEL_NAME.trycloudflare.com
    service: http://localhost:3000
  - service: http_status:404
EOF

log "Запускаем туннель..."
cloudflared tunnel run $TUNNEL_NAME &

sleep 5

TUNNEL_URL="https://$TUNNEL_NAME.trycloudflare.com"

log "✅ Туннель создан успешно!"
warn "📝 Важная информация:"
warn "   🔗 Ваш API URL: $TUNNEL_URL"
warn "   📝 Обновите VITE_API_URL в vercel.json на: $TUNNEL_URL"
warn "   🔄 Для постоянной работы добавьте в автозагрузку:"
warn "      sudo systemctl enable cloudflared"

echo ""
echo "🎉 Cloudflare Tunnel настроен!"
echo "🔗 API доступен по адресу: $TUNNEL_URL"
echo "🔧 Для остановки: pkill cloudflared" 