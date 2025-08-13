# 🔐 Настройка переменных окружения

## 📁 Где хранятся переменные:

### На сервере:
```
/home/projtron01/backend/.env
```

### На локальном компьютере:
```
backend/.env
```

## 🔧 Как настроить:

### 1. Создайте файл .env на сервере:

```bash
# Подключитесь к серверу
ssh root@91.219.237.178

# Перейдите в папку бекенда
cd /home/projtron01/backend

# Создайте файл .env
nano .env
```

### 2. Добавьте ваши переменные:

```bash
# TRON кошелек (ОБЯЗАТЕЛЬНО!)
PRIVATE_KEY=your_actual_private_key_here
WALLET_ADDRESS=your_actual_wallet_address_here
USDT_CONTRACT=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t

# Telegram бот (ОПЦИОНАЛЬНО)
TELEGRAM_BOT_TOKEN=your_actual_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_actual_telegram_chat_id_here

# Google Sheets (ОПЦИОНАЛЬНО)
GOOGLE_SHEETS_ID=your_actual_google_sheets_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_actual_service_account_email_here
GOOGLE_PRIVATE_KEY=your_actual_google_private_key_here

# Настройки сервера
PORT=3000
NODE_ENV=production
```

### 3. Сохраните файл:
- Нажмите `Ctrl + X`
- Нажмите `Y` для подтверждения
- Нажмите `Enter`

## 🔒 Безопасность:

### ✅ Что делать:
- Храните `.env` файл только на сервере
- Используйте сложные пароли и токены
- Регулярно обновляйте токены

### ❌ Что НЕ делать:
- НЕ коммитьте `.env` в Git
- НЕ передавайте токены в чатах
- НЕ используйте простые пароли

## 📝 Примеры переменных:

### Telegram Bot:
```bash
BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

### Криптовалютные ключи:
```bash
PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
PUBLIC_KEY=0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
```

### API ключи:
```bash
API_KEY=sk-1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
SECRET_KEY=your_secret_key_here
```

## 🔄 Обновление переменных:

### На сервере:
```bash
# Отредактируйте .env
nano /home/projtron01/backend/.env

# Перезапустите бекенд
pm2 restart exchange-backend
```

### Через Git (если нужно):
```bash
# Добавьте в .env.example (без реальных значений)
# Обновите на сервере
cd /home/projtron01
git pull origin main
nano backend/.env  # Добавьте реальные значения
pm2 restart exchange-backend
```

## ✅ Проверка:

### Проверьте, что переменные загружаются:
```bash
# На сервере
cd /home/projtron01/backend
node -e "require('dotenv').config(); console.log('BOT_TOKEN:', process.env.BOT_TOKEN ? 'SET' : 'NOT SET')"
```

## 🎯 Готово!

После настройки переменных:
1. **Перезапустите бекенд**: `pm2 restart exchange-backend`
2. **Проверьте логи**: `pm2 logs exchange-backend`
3. **Тестируйте API**: `curl https://cryptoxchange.click/api/health` 