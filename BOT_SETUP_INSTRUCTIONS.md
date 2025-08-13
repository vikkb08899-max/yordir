# 🤖 Инструкция по настройке Telegram бота

## Проблема
Бот не реагирует на команду `/start` потому что не настроены переменные окружения.

## Решение

### 1. Создайте бота в Telegram
1. Найдите @BotFather в Telegram
2. Отправьте команду `/newbot`
3. Следуйте инструкциям и получите токен бота

### 2. Настройте переменные окружения на сервере
Подключитесь к серверу и создайте/отредактируйте файл `.env` в папке `/home/projtron01/backend/`:

```bash
ssh root@91.219.237.178
cd /home/projtron01/backend
nano .env
```

Добавьте в файл `.env`:

```env
# Tron Network Configuration
PRIVATE_KEY=your_private_key_here
WALLET_ADDRESS=your_wallet_address_here
USDT_CONTRACT=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789

# Server Configuration
PORT=3000
```

### 3. Перезапустите сервер
```bash
pm2 restart exchange-backend
```

### 4. Проверьте логи
```bash
pm2 logs exchange-backend
```

Вы должны увидеть:
```
✅ Telegram бот инициализирован
🤖 Токен бота: Настроен
📱 Chat ID: Настроен
```

### 5. Протестируйте бота
1. Найдите вашего бота в Telegram
2. Отправьте команду `/start`
3. Выберите язык
4. Нажмите кнопку "Открыть приложение"

## Команды для тестирования
- `/start` - выбор языка
- `/test` - проверка работы бота
- `/rates` - просмотр наценок

## Если бот все еще не работает
1. Проверьте, что токен бота правильный
2. Убедитесь, что бот не заблокирован
3. Проверьте логи сервера на ошибки
4. Убедитесь, что файл .env находится в правильной папке 