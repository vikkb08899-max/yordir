# 🔒 Настройка HTTPS для бэкенда

## ⚠️ Проблема
Vercel работает по **HTTPS**, а ваш бэкенд по **HTTP** (91.219.237.178:3000).  
Браузеры блокируют смешанный контент - HTTPS сайт не может обращаться к HTTP API.

## 🎯 Решения

### 🏆 Вариант 1: Nginx + Let's Encrypt (Лучший)

**Нужен домен** (например: `api.yourdomain.com`)

```bash
# На сервере:
wget https://your-files/nginx-https-setup.sh
chmod +x nginx-https-setup.sh
sudo ./nginx-https-setup.sh
```

**Что делает скрипт:**
- Устанавливает Nginx
- Получает бесплатный SSL сертификат
- Настраивает прокси на ваш бэкенд (порт 3000)
- Открывает порты 80, 443

**Результат:** `https://api.yourdomain.com` → ваш бэкенд

---

### ☁️ Вариант 2: Cloudflare Tunnel (Без домена)

**Бесплатно, без домена, автоматический HTTPS**

```bash
# На сервере:
wget https://your-files/cloudflare-tunnel-setup.sh
chmod +x cloudflare-tunnel-setup.sh
./cloudflare-tunnel-setup.sh
```

**Результат:** `https://random-name.trycloudflare.com` → ваш бэкенд

---

### 🔧 Вариант 3: Простой (только для тестирования)

Временно открыть порт 3000 напрямую:

```bash
# На сервере:
sudo ufw allow 3000/tcp

# В vercel.json оставить:
"VITE_API_URL": "http://91.219.237.178:3000"
```

⚠️ **Не рекомендуется для продакшена** - нет HTTPS!

## 📋 Пошаговый план

### 1️⃣ Выберите вариант

**Есть домен?** → Вариант 1 (Nginx + Let's Encrypt)  
**Нет домена?** → Вариант 2 (Cloudflare Tunnel)  
**Только тест?** → Вариант 3 (Прямой HTTP)

### 2️⃣ Настройте HTTPS на сервере

Запустите соответствующий скрипт

### 3️⃣ Обновите vercel.json

```json
{
  "env": {
    "VITE_API_URL": "https://your-api-domain.com"
  }
}
```

### 4️⃣ Обновите CORS в бэкенде

```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'https://your-vercel-app.vercel.app',
];
```

### 5️⃣ Пересоберите фронтенд

```bash
./deploy-vercel.sh
```

## 🔍 Проверка

```bash
# Проверьте что API отвечает по HTTPS
curl https://your-api-domain.com/exchange-rates

# Должен вернуть JSON с курсами
```

## 🎉 Результат

✅ **HTTPS API** - безопасные запросы  
✅ **SSL сертификат** - доверие браузеров  
✅ **Работа с Vercel** - никаких блокировок  
✅ **Продакшн готовность** - профессиональная настройка  

---

**Рекомендую Вариант 1 если есть домен, или Вариант 2 если домена нет!** 