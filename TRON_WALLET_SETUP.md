# 🔑 Настройка TRON кошелька

## 📱 Создание TRON кошелька:

### Вариант 1: TronLink (рекомендуется)
1. **Установите TronLink** (браузерное расширение)
2. **Создайте кошелек** → "Create Wallet"
3. **Сохраните приватный ключ** (12 слов)
4. **Экспортируйте приватный ключ**:
   - Настройки → Security & Privacy → Export Private Key
   - Введите пароль
   - Скопируйте приватный ключ

### Вариант 2: Trust Wallet
1. **Установите Trust Wallet**
2. **Добавьте TRON** в список монет
3. **Экспортируйте приватный ключ**

### Вариант 3: Онлайн генератор (только для тестов!)
```bash
# Генерируем тестовую пару ключей
node -e "
const crypto = require('crypto');
const privateKey = '0x' + crypto.randomBytes(32).toString('hex');
console.log('Private Key:', privateKey);
console.log('⚠️  ВНИМАНИЕ: Это тестовый ключ!');
"
```

## 🎯 Что нужно получить:

### 1. **Приватный ключ:**
```
0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

### 2. **Адрес кошелька:**
```
TW5PbcV4RumU9pZBZ4sB1gZf4VgaLR8DXK
```

### 3. **Адрес контракта USDT:**
```
TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
```

## 🔧 Настройка в .env:

```bash
# TRON кошелек
PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
WALLET_ADDRESS=TW5PbcV4RumU9pZBZ4sB1gZf4VgaLR8DXK
USDT_CONTRACT=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t

# Telegram бот (опционально)
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789

# Настройки сервера
PORT=3000
NODE_ENV=production
```

## ⚠️ ВАЖНО:

### ✅ **Для тестирования:**
- Используйте тестовую сеть TRON
- Пополните тестовый кошелек через faucet
- Не используйте реальные деньги

### ✅ **Для продакшена:**
- Создайте отдельный кошелек
- Пополните небольшими суммами
- Регулярно выводите средства

### ❌ **НЕ делайте:**
- Не используйте основной кошелек
- Не храните большие суммы
- Не передавайте приватный ключ

## 🚀 Готово!

После настройки:
1. **Проверьте баланс**: `curl https://cryptoxchange.click/api/balance`
2. **Тестируйте обмен**: `curl https://cryptoxchange.click/api/exchange-rates` 