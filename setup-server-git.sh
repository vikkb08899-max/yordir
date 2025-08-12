#!/bin/bash

# Настройка сервера для Git workflow
# Этот скрипт нужно запустить на сервере

set -e

echo "🚀 Настройка сервера для Git workflow..."

# Настройки
GIT_REPO="https://github.com/yourusername/projtron01.git"  # ЗАМЕНИТЕ на ваш репозиторий
PROJECT_PATH="/home/projtron01"
DOMAIN="cryptoxchange.click"

# Обновляем систему
echo "📦 Обновляем систему..."
apt update && apt upgrade -y

# Устанавливаем необходимые пакеты
echo "📦 Устанавливаем пакеты..."
apt install -y git curl wget nginx certbot python3-certbot-nginx

# Устанавливаем Node.js
echo "📦 Устанавливаем Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Устанавливаем PM2
echo "📦 Устанавливаем PM2..."
npm install -g pm2

# Создаем директорию проекта
echo "📁 Создаем директорию проекта..."
mkdir -p $PROJECT_PATH
cd $PROJECT_PATH

# Клонируем репозиторий (если еще не клонирован)
if [ ! -d ".git" ]; then
    echo "📥 Клонируем репозиторий..."
    git clone $GIT_REPO .
    git checkout main
else
    echo "📥 Обновляем репозиторий..."
    git fetch origin
    git reset --hard origin/main
fi

# Устанавливаем зависимости бекенда
echo "📦 Устанавливаем зависимости бекенда..."
cd backend
npm install

# Настраиваем PM2
echo "🔧 Настраиваем PM2..."
if pm2 list | grep -q "exchange-backend"; then
    pm2 restart exchange-backend
else
    pm2 start server.js --name "exchange-backend"
fi

pm2 save
pm2 startup

# Создаем директорию для фронтенда
echo "📁 Создаем директорию для фронтенда..."
mkdir -p /var/www/html

# Настраиваем Nginx
echo "🔧 Настраиваем Nginx..."
cat > /etc/nginx/sites-available/$DOMAIN << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # API - proxy to backend
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # CORS
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
    }
    
    # Frontend
    location / {
        root /var/www/html;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

# Активируем сайт
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Проверяем конфигурацию Nginx
nginx -t

# Перезапускаем Nginx
systemctl restart nginx
systemctl enable nginx

# Открываем порты в firewall
echo "🔥 Настраиваем firewall..."
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable

# Получаем SSL сертификат
echo "🔒 Получаем SSL сертификат..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email your-email@example.com

# Создаем скрипт для обновления проекта
echo "📝 Создаем скрипт обновления..."
cat > $PROJECT_PATH/update-project.sh << 'EOF'
#!/bin/bash
# Скрипт для обновления проекта на сервере

echo "🔄 Обновляем проект..."

cd /home/projtron01

# Подтягиваем изменения из Git
git fetch origin
git reset --hard origin/main

# Обновляем зависимости бекенда
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

echo "✅ Проект обновлен!"
EOF

chmod +x $PROJECT_PATH/update-project.sh

echo "✅ Настройка сервера завершена!"
echo ""
echo "📋 Что нужно сделать дальше:"
echo "1. Замените 'yourusername' в GIT_REPO на ваше имя пользователя GitHub"
echo "2. Замените 'your-email@example.com' на ваш email для SSL"
echo "3. Скопируйте фронтенд: npm run deploy:frontend"
echo "4. Проверьте работу: https://$DOMAIN" 