# ⚡ Быстрая настройка TRX Exchange

## 🎯 За 10 минут до продакшена!

### 1️⃣ Фронтенд на Vercel (3 минуты)

```bash
# Установите Vercel CLI (если еще нет)
npm install -g vercel

# Войдите в аккаунт
vercel login

# Обновите IP сервера в vercel.json
# Замените "YOUR_SERVER_IP" на реальный IP

# Деплой одной командой
chmod +x deploy-vercel.sh
./deploy-vercel.sh
```

**Готово!** Получите URL типа: `https://tron-exchange-xxx.vercel.app`

### 2️⃣ Бэкенд на сервер (7 минут)

```bash
# Загрузите архив на сервер
scp backend-deploy.tar.gz user@your-server:~/

# На сервере:
tar -xzf backend-deploy.tar.gz
cd backend

# Создайте .env файл:
nano .env
```

**Содержимое .env:**
```env
NODE_ENV=production
PORT=3000
PRIVATE_KEY=ваш_приватный_ключ_мейннет
WALLET_ADDRESS=ваш_адрес_кошелька_мейннет
USDT_CONTRACT=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
```

```bash
# Запустите бэкенд
chmod +x ../backend-deploy.sh
../backend-deploy.sh
```

### 3️⃣ Связка (1 минута)

Обновите CORS в `backend/server.js`:
```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'https://tron-exchange-xxx.vercel.app', // Ваш Vercel URL
];
```

```bash
# Перезапустите бэкенд
pm2 restart tron-exchange-backend
```

## ✅ Проверка

1. **Откройте Vercel URL**
2. **Проверьте что курсы загружаются**
3. **Создайте тестовый обмен**

## 📱 Результат

- 🌐 **Фронтенд**: `https://your-app.vercel.app`
- 🖥️ **Бэкенд**: `http://your-server-ip:3000`
- 🔒 **Безопасность**: Приватные ключи только на вашем сервере
- ⚡ **Скорость**: CDN для фронтенда, прямое подключение к блокчейну

---

**Готово за 10 минут! 🎉** 