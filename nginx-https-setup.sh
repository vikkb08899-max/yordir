#!/bin/bash

# Настройка HTTPS для бэкенда TRX Exchange
set -e

echo "🔒 Настройка HTTPS для бэкенда..."

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

# Проверяем что скрипт запущен с sudo
if [ "$EUID" -ne 0 ]; then
    error "Запустите скрипт с sudo: sudo ./nginx-https-setup.sh"
fi

# Запрашиваем домен
read -p "Введите ваш домен (например: api.yourdomain.com): " DOMAIN

if [ -z "$DOMAIN" ]; then
    error "Домен не может быть пустым"
fi

log "Устанавливаем Nginx..."
apt update
apt install -y nginx

log "Устанавливаем Certbot..."
apt install -y certbot python3-certbot-nginx

log "Создаем конфигурацию Nginx..."
cat > /etc/nginx/sites-available/tron-exchange-api << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    # Временная конфигурация для получения SSL
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # CORS заголовки
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization";
        
        # Обработка preflight запросов
        if (\$request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin *;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Content-Type, Authorization";
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 204;
        }
    }
}
EOF

log "Активируем конфигурацию..."
ln -sf /etc/nginx/sites-available/tron-exchange-api /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

log "Проверяем конфигурацию Nginx..."
nginx -t

log "Перезапускаем Nginx..."
systemctl reload nginx

log "Получаем SSL сертификат..."
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

log "Настраиваем автообновление сертификата..."
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -

log "Открываем порты в файрволе..."
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw --force enable

log "✅ HTTPS настроен успешно!"
warn "📝 Важно:"
warn "   1. Ваш API теперь доступен по адресу: https://$DOMAIN"
warn "   2. Обновите VITE_API_URL в vercel.json на: https://$DOMAIN"
warn "   3. Обновите CORS в backend/server.js"
warn "   4. Убедитесь что ваш бэкенд запущен на порту 3000"

echo ""
echo "🎉 Готово! Ваш бэкенд теперь работает по HTTPS"
echo "🔗 API URL: https://$DOMAIN" 