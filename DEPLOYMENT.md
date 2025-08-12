# 🚀 Деплой TRX Exchange на продакшн сервер

## Предварительные требования

### На сервере должно быть установлено:
- **Ubuntu 20.04+** или **CentOS 8+**
- **Docker** и **Docker Compose**
- **Nginx** (опционально, если не используете Docker)
- **Node.js 18+** (если деплоите без Docker)
- **PM2** (для управления процессами)

## Шаг 1: Подготовка сервера

### Установка Docker
```bash
# Ubuntu
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Установка Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Настройка файрвола
```bash
# Открываем порты
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP  
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

## Шаг 2: Загрузка проекта на сервер

```bash
# Клонируем проект
git clone https://github.com/ваш_username/tron-exchange.git
cd tron-exchange

# Или загружаем архив
scp -r ./tron-exchange user@your-server:/home/user/
```

## Шаг 3: Настройка переменных окружения

Создайте файл `backend/.env`:

```env
# Основные настройки
NODE_ENV=production
PORT=3000

# Tron настройки (МЕЙННЕТ)
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

## Шаг 4: Настройка домена

### Обновите файл `nginx.conf`:
```nginx
# Замените "ваш_домен.com" на ваш реальный домен
server_name your-domain.com www.your-domain.com;
```

### Настройка DNS
Добавьте A-записи в DNS:
```
your-domain.com    A    IP_ВАШЕГО_СЕРВЕРА
www.your-domain.com A   IP_ВАШЕГО_СЕРВЕРА
```

## Шаг 5: SSL сертификаты

### Вариант 1: Let's Encrypt (рекомендуется)
```bash
# Установка Certbot
sudo apt install certbot

# Получение сертификата
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Копирование сертификатов
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/key.pem
sudo chown $USER:$USER ./ssl/*.pem
```

### Вариант 2: Самоподписанные (только для тестирования)
```bash
mkdir -p ssl
openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=your-domain.com"
```

## Шаг 6: Деплой

### Автоматический деплой
```bash
# Делаем скрипт исполняемым
chmod +x deploy.sh

# Запускаем деплой
./deploy.sh
```

### Ручной деплой
```bash
# Устанавливаем зависимости и собираем фронтенд
npm install
npm run build

# Собираем и запускаем контейнеры
docker-compose up --build -d
```

## Шаг 7: Проверка работы

```bash
# Проверяем статус контейнеров
docker-compose ps

# Проверяем логи
docker-compose logs -f

# Проверяем доступность
curl -k https://your-domain.com
```

## Шаг 8: Мониторинг и обслуживание

### Полезные команды
```bash
# Просмотр логов
docker-compose logs -f app      # Логи приложения
docker-compose logs -f nginx    # Логи Nginx

# Перезапуск сервисов
docker-compose restart app
docker-compose restart nginx

# Обновление приложения
git pull
docker-compose up --build -d

# Резервное копирование логов
tar -czf logs-backup-$(date +%Y%m%d).tar.gz logs/
```

### Автоматическое обновление SSL
```bash
# Добавьте в crontab
sudo crontab -e

# Добавьте строку (обновление каждые 2 месяца)
0 0 1 */2 * certbot renew --quiet && docker-compose restart nginx
```

## Структура проекта на сервере

```
/home/user/tron-exchange/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env                 # Переменные окружения
├── dist/                    # Собранный фронтенд
├── logs/                    # Логи приложения
├── ssl/                     # SSL сертификаты
│   ├── cert.pem
│   └── key.pem
├── docker-compose.yml       # Docker конфигурация
├── nginx.conf              # Nginx конфигурация
├── Dockerfile              # Docker образ
├── ecosystem.config.js     # PM2 конфигурация
└── deploy.sh              # Скрипт деплоя
```

## Безопасность

### Рекомендации:
1. **Никогда не коммитьте .env файлы в Git**
2. **Используйте сильные пароли и ключи**
3. **Регулярно обновляйте систему и зависимости**
4. **Настройте мониторинг и алерты**
5. **Делайте резервные копии**

### Настройка файрвола
```bash
# Закрываем прямой доступ к порту приложения
sudo ufw deny 3000

# Разрешаем только HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443
```

## Траблшутинг

### Проблемы с контейнерами
```bash
# Проверить статус
docker-compose ps

# Перезапустить все
docker-compose down && docker-compose up -d

# Очистить кэш Docker
docker system prune -a
```

### Проблемы с SSL
```bash
# Проверить сертификаты
openssl x509 -in ssl/cert.pem -text -noout

# Тест SSL соединения
openssl s_client -connect your-domain.com:443
```

### Проблемы с доменом
```bash
# Проверить DNS
nslookup your-domain.com
dig your-domain.com

# Проверить доступность
curl -I https://your-domain.com
```

## Поддержка

При возникновении проблем:
1. Проверьте логи: `docker-compose logs -f`
2. Проверьте статус контейнеров: `docker-compose ps`
3. Проверьте конфигурацию: `nginx -t`
4. Проверьте переменные окружения в `.env`

---

🎉 **После успешного деплоя ваш TRX Exchange будет доступен по адресу: `https://your-domain.com`** 