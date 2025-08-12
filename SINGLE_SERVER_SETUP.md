# 🚀 Размещение всего проекта на одном сервере

## 📋 Преимущества одного сервера:
- ✅ Один домен для всего
- ✅ Никаких CORS проблем
- ✅ Проще в управлении
- ✅ Дешевле (только домен + сервер)

## 🌐 Структура:
```
cryptoxchange.click/ → Фронтенд (статические файлы)
cryptoxchange.click/api/ → Бекенд API
```

## 📝 Пошаговая инструкция:

### Шаг 1: Настройте DNS для cryptoxchange.click
В панели управления доменом создайте A-записи:
```
Тип: A
Имя: @ 
Значение: 91.219.237.178
TTL: 300

Тип: A
Имя: www
Значение: 91.219.237.178
TTL: 300
```

### Шаг 2: Соберите фронтенд для продакшена
```bash
# В корне проекта
npm run build
```

### Шаг 3: Настройте сервер

#### 3.1 Скопируйте файлы на сервер
```bash
# Скопируйте папку backend
scp -r backend/ root@91.219.237.178:/home/

# Скопируйте собранный фронтенд
scp -r dist/ root@91.219.237.178:/var/www/html/
```

#### 3.2 Установите зависимости на сервере
```bash
# На сервере
cd /home/backend
npm install

# Установите PM2 для автозапуска
npm install -g pm2
```

#### 3.3 Настройте nginx
```bash
# Создайте конфигурацию nginx
sudo tee /etc/nginx/sites-available/exchange <<'EOF'
server {
    listen 80;
    server_name cryptoxchange.click www.cryptoxchange.click;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name cryptoxchange.click www.cryptoxchange.click;
    
    # SSL сертификаты (будут созданы автоматически)
    ssl_certificate /etc/letsencrypt/live/cryptoxchange.click/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cryptoxchange.click/privkey.pem;
    
    # Корневая папка для фронтенда
    root /var/www/html;
    index index.html;
    
    # Фронтенд - все запросы кроме API
    location / {
        try_files $uri $uri/ /index.html;
        expires 1d;
        add_header Cache-Control "public, no-transform";
    }
    
    # API - проксируем на бекенд
    location /api/ {
        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Статические файлы
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Конфигурация уже содержит ваш домен cryptoxchange.click

# Активируйте конфигурацию
sudo ln -sf /etc/nginx/sites-available/exchange /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
```

#### 3.4 Получите SSL сертификат
```bash
# Установите certbot
sudo apt install certbot python3-certbot-nginx -y

# Получите сертификат
sudo certbot --nginx -d cryptoxchange.click -d www.cryptoxchange.click

# Перезапустите nginx
sudo systemctl restart nginx
```

#### 3.5 Запустите бекенд
```bash
cd /home/backend
pm2 start server.js --name "exchange-backend"
pm2 save
pm2 startup
```

### Шаг 4: Обновите API URL во фронтенде

Обновите `src/services/exchangeApi.ts`:
```typescript
const API_URL = '/api'; // Относительный путь, так как всё на одном домене
```

Пересоберите и загрузите фронтенд:
```bash
npm run build
scp -r dist/* root@91.219.237.178:/var/www/html/
```

## ✅ Проверка работы:

1. **Фронтенд**: https://cryptoxchange.click
2. **API**: https://cryptoxchange.click/api/exchange-rates

## 🔧 Управление:

```bash
# Статус бекенда
pm2 status

# Логи
pm2 logs exchange-backend

# Перезапуск бекенда
pm2 restart exchange-backend

# Обновление фронтенда
npm run build
scp -r dist/* root@91.219.237.178:/var/www/html/
```

## 🎉 Готово!

Теперь у вас:
- ✅ Один домен для всего
- ✅ HTTPS везде
- ✅ Никаких CORS проблем
- ✅ Простое управление 