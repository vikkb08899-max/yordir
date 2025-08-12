# 🚀 Деплой на Vercel без Git (через CLI)

## 📋 Что нужно сделать:

### 1️⃣ Установить Vercel CLI
```bash
npm install -g vercel
```

### 2️⃣ Войти в аккаунт Vercel
```bash
vercel login
```
Выберите способ входа (GitHub, GitLab, Email)

### 3️⃣ Подготовить проект
```bash
# Убедитесь что проект собран
npm run build

# Проверьте что dist/ папка создана
ls -la dist/
```

### 4️⃣ Настроить переменные окружения
Создайте файл `.env.local` (для локального тестирования):
```env
VITE_API_URL=http://YOUR_SERVER_IP:3000
```

### 5️⃣ Деплой проекта
```bash
# Из корневой папки проекта
vercel

# При первом деплое ответьте на вопросы:
# ? Set up and deploy "~/project"? [Y/n] y
# ? Which scope do you want to deploy to? Your Personal Account
# ? Link to existing project? [y/N] n
# ? What's your project's name? tron-exchange
# ? In which directory is your code located? ./
```

### 6️⃣ Настроить переменные окружения в продакшене
```bash
# Добавить переменную окружения
vercel env add VITE_API_URL

# Введите значение: http://YOUR_SERVER_IP:3000
# Выберите окружение: Production, Preview, Development (выберите все)
```

### 7️⃣ Пересобрать с новыми переменными
```bash
# Пересобрать проект с продакшн переменными
vercel --prod
```

## 🎯 Альтернативный способ - с настройкой сразу

Создайте файл `vercel.json` с переменными:

```json
{
  "version": 2,
  "name": "tron-exchange",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_API_URL": "http://YOUR_SERVER_IP:3000"
  }
}
```

Затем просто:
```bash
vercel --prod
```

## 🔧 Управление проектом

### Просмотр деплоев
```bash
vercel ls
```

### Просмотр логов
```bash
vercel logs
```

### Удаление проекта
```bash
vercel remove tron-exchange
```

### Обновление проекта
```bash
# После изменений в коде:
npm run build
vercel --prod
```

## 📱 Получение URL

После успешного деплоя вы получите:
- **Production URL**: `https://tron-exchange-xxx.vercel.app`
- **Preview URL**: для тестирования

## 🔗 Связка с бэкендом

1. **Получите URL фронтенда** после деплоя
2. **Обновите CORS в бэкенде** (`backend/server.js`):
```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://tron-exchange-xxx.vercel.app', // Ваш Vercel URL
  'https://your-custom-domain.com'        // Если есть кастомный домен
];
```

3. **Перезапустите бэкенд**:
```bash
pm2 restart tron-exchange-backend
```

## 🎉 Готово!

Теперь у вас есть:
- ✅ **Фронтенд на Vercel** - быстрый, с CDN, HTTPS
- ✅ **Бэкенд на вашем сервере** - безопасный, под контролем
- ✅ **Без Git** - деплой прямо с локальной машины

## 🔄 Процесс обновления

Когда нужно обновить фронтенд:
```bash
# 1. Внесите изменения в код
# 2. Пересоберите
npm run build

# 3. Задеплойте
vercel --prod
```

---

**Этот способ идеален для быстрого тестирования и когда не хочется настраивать Git!** 