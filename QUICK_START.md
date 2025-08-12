# 🚀 Быстрый запуск cryptoxchange.click

## 📋 Что нужно сделать:

### 1. Настройте DNS (в панели управления доменом)
```
A-запись: @ → 91.219.237.178
A-запись: www → 91.219.237.178
```

### 2. Соберите фронтенд
```bash
npm run build
```

### 3. Скопируйте файлы на сервер
```bash
# Фронтенд
scp -r dist/* root@91.219.237.178:/var/www/html/

# Бекенд
scp -r backend/ root@91.219.237.178:/home/
```

### 4. На сервере выполните:
```bash
# Установите nginx и certbot
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx -y

# Создайте папку для сайта
sudo mkdir -p /var/www/html

# Установите временную конфигурацию nginx (без SSL)
sudo cp /home/nginx-temp-http.conf /etc/nginx/sites-available/exchange
sudo ln -sf /etc/nginx/sites-available/exchange /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Запустите nginx
sudo nginx -t
sudo systemctl start nginx

# Установите зависимости бекенда и запустите его
cd /home/backend
npm install
npm install -g pm2
pm2 start server.js --name "exchange-backend"

# Получите SSL сертификат
sudo certbot --nginx -d cryptoxchange.click -d www.cryptoxchange.click

# Установите финальную конфигурацию nginx (с SSL)
sudo cp /home/nginx-cryptoxchange.conf /etc/nginx/sites-available/exchange

# Перезапустите nginx
sudo nginx -t
sudo systemctl restart nginx

# Настройте автозапуск
pm2 save
pm2 startup
```

## ✅ Проверка:
- Фронтенд: https://cryptoxchange.click
- API: https://cryptoxchange.click/api/exchange-rates

## 🔧 Управление:
```bash
# Статус
pm2 status
sudo systemctl status nginx

# Логи
pm2 logs exchange-backend
sudo tail -f /var/log/nginx/error.log

# Обновление фронтенда
npm run build
scp -r dist/* root@91.219.237.178:/var/www/html/
```

🎉 **Готово!** Ваш обменник будет работать на https://cryptoxchange.click 