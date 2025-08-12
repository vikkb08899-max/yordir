# 🌐 Настройка домена для фронтенда и API

## 🎯 Архитектура

```
Фронтенд: https://myapp.com        → Vercel
API:      https://api.myapp.com    → Ваш сервер (91.219.237.178)
```

## 📋 Пошаговая настройка

### 1️⃣ Купите домен

Любой регистратор (Namecheap, GoDaddy, Cloudflare, etc.)  
Например: `myapp.com`

### 2️⃣ Настройте DNS записи

В панели управления доменом добавьте:

```dns
# Для фронтенда (Vercel)
Type: CNAME
Name: @
Value: cname.vercel-dns.com

Type: CNAME  
Name: www
Value: cname.vercel-dns.com

# Для API (ваш сервер)
Type: A
Name: api
Value: 91.219.237.178
```

### 3️⃣ Настройте Vercel

1. **В настройках проекта Vercel → Domains**
2. **Добавьте домен:** `myapp.com`
3. **Vercel покажет инструкции по DNS** (если нужно)

### 4️⃣ Настройте HTTPS на сервере

```bash
# Загрузите скрипт на сервер
scp nginx-https-setup.sh user@91.219.237.178:~/

# На сервере:
chmod +x nginx-https-setup.sh
sudo ./nginx-https-setup.sh

# Введите домен: api.myapp.com
```

### 5️⃣ Обновите конфигурацию

**В vercel.json:**
```json
{
  "env": {
    "VITE_API_URL": "https://api.myapp.com"
  }
}
```

**В backend/server.js (CORS):**
```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'https://myapp.com',
  'https://www.myapp.com'
];
```

### 6️⃣ Пересоберите и деплойте

```bash
# Локально:
./deploy-vercel.sh

# На сервере:
pm2 restart tron-exchange-backend
```

## ✅ Результат

- 🌐 **Фронтенд**: `https://myapp.com` (быстрый CDN)
- 🔌 **API**: `https://api.myapp.com` (ваш сервер)
- 🔒 **HTTPS везде** - безопасность и доверие
- 📱 **Профессиональный вид** - собственный домен

## 💰 Стоимость

- **Домен**: ~$10-15/год
- **SSL сертификат**: Бесплатно (Let's Encrypt)
- **Vercel**: Бесплатно для личных проектов
- **Сервер**: Ваша текущая стоимость

## 🔄 Альтернатива без покупки домена

Если не хотите покупать домен, используйте **Cloudflare Tunnel**:

```bash
# На сервере:
./cloudflare-tunnel-setup.sh
# Получите: https://random-name.trycloudflare.com
```

Тогда в vercel.json:
```json
{
  "env": {
    "VITE_API_URL": "https://random-name.trycloudflare.com"
  }
}
```

## 🎉 Что лучше?

**Собственный домен** - профессионально, стабильно, красиво  
**Cloudflare Tunnel** - бесплатно, быстро, но URL может измениться

---

**Какой вариант выбираете? Есть ли у вас предпочтения по домену?** 