#!/bin/bash

# Скрипт для настройки переменных окружения на сервере
# Использование: ./setup-env.sh

echo "🔐 Настройка переменных окружения на сервере..."

# Подключаемся к серверу и создаем .env файл
ssh -o PubkeyAuthentication=no root@91.219.237.178 << 'EOF'
    echo "📁 Создаем .env файл..."
    cd /home/projtron01/backend
    
    # Создаем .env файл если его нет
    if [ ! -f ".env" ]; then
        cat > .env << 'ENVFILE'
# Переменные окружения для бекенда
# ЗАПОЛНИТЕ РЕАЛЬНЫМИ ЗНАЧЕНИЯМИ!

# TRON кошелек (ОБЯЗАТЕЛЬНО!)
PRIVATE_KEY=your_private_key_here
WALLET_ADDRESS=your_wallet_address_here
USDT_CONTRACT=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t

# Telegram бот (ОПЦИОНАЛЬНО)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_telegram_chat_id_here

# Google Sheets (ОПЦИОНАЛЬНО)
GOOGLE_SHEETS_ID=your_google_sheets_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email_here
GOOGLE_PRIVATE_KEY=your_google_private_key_here

# Настройки сервера
PORT=3000
NODE_ENV=production
ENVFILE
        echo "✅ .env файл создан"
    else
        echo "⚠️  .env файл уже существует"
    fi
    
    echo ""
    echo "📝 Теперь отредактируйте .env файл:"
    echo "nano /home/projtron01/backend/.env"
    echo ""
    echo "🔧 После редактирования перезапустите бекенд:"
    echo "pm2 restart exchange-backend"
EOF

echo "✅ Настройка завершена!"
echo ""
echo "📋 Следующие шаги:"
echo "1. Подключитесь к серверу: ssh root@91.219.237.178"
echo "2. Отредактируйте .env: nano /home/projtron01/backend/.env"
echo "3. Добавьте реальные значения токенов и ключей"
echo "4. Перезапустите бекенд: pm2 restart exchange-backend" 