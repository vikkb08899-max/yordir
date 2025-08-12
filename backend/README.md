# Бэкенд обменника TRX/USDT

Это простой бэкенд для обмена TRX и USDT в тестовой сети Tron (Shasta).

## Настройка

1. Установите зависимости:
   ```
   npm install
   ```

2. Создайте файл `.env` на основе `.env.example`:
   ```
   cp .env.example .env
   ```

3. Заполните в файле `.env` следующие поля:
   - `PRIVATE_KEY`: Приватный ключ вашего Tron кошелька
   - `WALLET_ADDRESS`: Публичный адрес вашего Tron кошелька
   - `USDT_CONTRACT`: Адрес контракта USDT в тестовой сети (уже указан)

## Запуск сервера

Для разработки:
```
npm run dev
```

Для продакшена:
```
npm start
```

## API Endpoints

### 1. Создание заявки на обмен

**POST /exchange-request**

Тело запроса:
```json
{
  "from": "USDT",  // или "TRX"
  "to": "TRX",     // или "USDT"
  "amount": 100,
  "destinationAddress": "TJSsYc1zzZZYxUoZD9EgGAz9Ke...."
}
```

Ответ:
```json
{
  "success": true,
  "requestId": "unique-request-id",
  "paymentDetails": {
    "address": "TW5PbcV4RumU9pZBZ4sB1gZf4VgaLR8DXK",
    "amount": 100,
    "currency": "USDT",
    "toReceive": "8.5000",
    "toCurrency": "TRX",
    "exchangeRate": 0.085,
    "expirationTime": "2023-08-01T12:00:00.000Z",
    "message": "Пожалуйста, отправьте точно указанную сумму в течение 15 минут"
  }
}
```

### 2. Проверка статуса заявки

**GET /exchange-status/:id**

Ответ:
```json
{
  "success": true,
  "request": {
    "id": "unique-request-id",
    "status": "pending", // или "completed", "expired", "error"
    "from": "USDT",
    "to": "TRX",
    "fromAmount": 100,
    "toAmount": 8.5,
    "destinationAddress": "TJSsYc1zzZZYxUoZD9EgGAz9Ke....",
    "createdAt": "2023-08-01T11:45:00.000Z",
    "expirationTime": "2023-08-01T12:00:00.000Z",
    "txHash": null // Будет заполнено после успешной обработки
  }
}
```

## Примечания

- Проверка входящих транзакций происходит каждые 10 секунд
- Заявка действительна в течение 15 минут после создания
- Фиксированный курс обмена: 1 USDT = 0.085 TRX и 1 TRX = 11.76 USDT 