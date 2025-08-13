# 🤖 Настройка Telegram бота

## 📱 Создание бота:

### 1. **Найдите @BotFather в Telegram**
### 2. **Отправьте команду:**
```
/newbot
```

### 3. **Следуйте инструкциям:**
- Введите имя бота (например: "CryptoExchange Bot")
- Введите username (например: "crypto_exchange_bot")

### 4. **Получите токен:**
```
1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

## 🆔 Получение Chat ID:

### Вариант 1: Через бота @userinfobot
1. **Найдите @userinfobot**
2. **Отправьте любое сообщение**
3. **Получите ваш Chat ID**

### Вариант 2: Через API
```bash
# Замените YOUR_BOT_TOKEN на ваш токен
curl "https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates"
```

## 🔧 Настройка в .env:

```bash
# Telegram бот
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789
```

## 🎯 Функции бота:

### Команды:
- `/rates` - показать текущие наценки
- `/rate PAIR VALUE` - установить наценку (например: `/rate TRX_USDT 2.5`)

### Примеры:
```
/rates
/rate TRX_USDT 2.5
/rate USDT_TRX 1.8
```

## ✅ Готово!

После настройки:
1. **Перезапустите бекенд**: `pm2 restart exchange-backend`
2. **Отправьте команду боту**: `/rates`
3. **Проверьте уведомления** о новых обменах 