# 🚀 Деплой: Фронтенд на Vercel + Бэкенд на сервер

## 🎯 Архитектура

```
┌─────────────────┐    HTTPS/API    ┌──────────────────┐
│   Vercel CDN    │ ──────────────► │   Ваш сервер     │
│   (Фронтенд)    │                 │   (Бэкенд)       │
│                 │                 │                  │
│ ✅ Быстрая CDN   │                 │ ✅ Полный контроль│
│ ✅ Auto HTTPS    │                 │ ✅ Безопасность   │
│ ✅ Auto Deploy   │                 │ ✅ Стабильность   │
└─────────────────┘                 └──────────────────┘
```

## 📱 Часть 1: Деплой фронтенда на Vercel

### 1.1 Подготовка репозитория

```bash
# Создаем Git репозиторий (если еще нет)
git init
git add .
git commit -m "Initial commit"

# Пушим в GitHub/GitLab
git remote add origin https://github.com/username/tron-exchange.git
git push -u origin main
```

### 1.2 Настройка Vercel

1. **Перейдите на [vercel.com](https://vercel.com)**
2. **Войдите через GitHub**
3. **Нажмите "New Project"**
4. **Выберите ваш репозиторий**
5. **Настройте проект:**

```
Project Name: tron-exchange
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 1.3 Переменные окружения в Vercel

В настройках проекта добавьте:

```env
VITE_API_URL=https://your-server-domain.com
```

**Или если у вас IP сервера:**
```env
VITE_API_URL=http://YOUR_SERVER_IP:3000
```

### 1.4 Кастомный домен (опционально)

1. **В настройках Vercel → Domains**
2. **Добавьте ваш домен**
3. **Настройте DNS записи:**

```
Type: CNAME
Name: @
Value: cname.vercel-dns.com

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

## 🖥️ Часть 2: Деплой бэкенда на сервер

### 2.1 Подготовка сервера

```bash
# Обновляем систему
sudo apt update && sudo apt upgrade -y

# Устанавливаем Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Устанавливаем PM2
sudo npm install -g pm2

# Настраиваем файрвол
sudo ufw allow 22    # SSH
sudo ufw allow 3000  # API
sudo ufw enable
```

### 2.2 Загрузка бэкенда

```bash
# Создаем директорию
mkdir -p ~/tron-exchange-backend
cd ~/tron-exchange-backend

# Копируем файлы бэкенда (выберите один способ)

# Способ 1: Git clone
git clone https://github.com/username/tron-exchange.git .
cd backend

# Способ 2: SCP
scp -r ./backend/* user@server:~/tron-exchange-backend/

# Способ 3: Rsync
rsync -avz ./backend/ user@server:~/tron-exchange-backend/
```

### 2.3 Настройка окружения

Создайте файл `.env`:

```env
# Основные настройки
NODE_ENV=production
PORT=3000

# Tron мейннет настройки
PRIVATE_KEY=ваш_приватный_ключ_мейннет
WALLET_ADDRESS=ваш_адрес_кошелька_мейннет
USDT_CONTRACT=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t

# Telegram бот (опционально)
TELEGRAM_BOT_TOKEN=ваш_токен_бота
TELEGRAM_CHAT_ID=ваш_chat_id

# Google Sheets (опционально)
GOOGLE_SHEETS_ID=id_вашей_таблицы
GOOGLE_SERVICE_ACCOUNT_EMAIL=email@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 2.4 Обновление CORS

В файле `server.js` обновите список разрешенных доменов:

```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://your-vercel-app.vercel.app', // Ваш Vercel домен
  'https://your-custom-domain.com'      // Ваш кастомный домен
];
```

### 2.5 Запуск бэкенда

```bash
# Делаем скрипт исполняемым
chmod +x backend-deploy.sh

# Запускаем деплой
./backend-deploy.sh
```

**Или вручную:**
```bash
npm install --production
pm2 start server.js --name "tron-exchange-backend"
pm2 save
pm2 startup
```

## 🔗 Часть 3: Связка фронтенда и бэкенда

### 3.1 Получите URL бэкенда

```bash
# Проверьте IP сервера
curl ifconfig.me

# Или используйте домен
# API будет доступен по адресу:
# http://YOUR_SERVER_IP:3000
# или
# https://your-backend-domain.com
```

### 3.2 Обновите переменные в Vercel

1. **Зайдите в настройки проекта в Vercel**
2. **Environment Variables**
3. **Обновите `VITE_API_URL`:**

```env
VITE_API_URL=http://YOUR_SERVER_IP:3000
```

### 3.3 Пересоберите фронтенд

Vercel автоматически пересоберет проект при изменении переменных окружения.

## 🧪 Часть 4: Тестирование

### 4.1 Проверка бэкенда

```bash
# Проверяем статус
pm2 status

# Проверяем логи
pm2 logs tron-exchange-backend

# Тестируем API
curl http://YOUR_SERVER_IP:3000/exchange-rates
```

### 4.2 Проверка фронтенда

1. **Откройте ваш Vercel домен**
2. **Проверьте консоль браузера на ошибки**
3. **Протестируйте создание обмена**

### 4.3 Проверка связки

```bash
# В консоли браузера должны быть успешные запросы к API
# Network tab → XHR → проверьте запросы к вашему серверу
```

## 🔧 Управление и мониторинг

### Бэкенд (сервер)
```bash
pm2 status                           # Статус процессов
pm2 logs tron-exchange-backend       # Логи
pm2 restart tron-exchange-backend    # Перезапуск
pm2 stop tron-exchange-backend       # Остановка
pm2 monit                           # Мониторинг в реальном времени
```

### Фронтенд (Vercel)
- **Автоматические деплои** при пуше в Git
- **Логи деплоя** в панели Vercel
- **Analytics** и **Performance** встроены

## 🛡️ Безопасность

### Настройка HTTPS для бэкенда (рекомендуется)

```bash
# Установка Nginx как прокси
sudo apt install nginx

# Получение SSL сертификата
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-backend-domain.com

# Настройка прокси в /etc/nginx/sites-available/default
server {
    listen 443 ssl;
    server_name your-backend-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 Преимущества такой архитектуры

✅ **Фронтенд на Vercel:**
- Быстрая загрузка через CDN
- Автоматические деплои
- Бесплатный HTTPS
- Глобальная доступность

✅ **Бэкенд на вашем сервере:**
- Полный контроль над кошельком
- Безопасность приватных ключей
- Стабильная работа с блокчейном
- Гибкость настроек

---

🎉 **После настройки у вас будет профессиональная архитектура с быстрым фронтендом и надежным бэкендом!** 