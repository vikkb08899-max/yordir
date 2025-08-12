# 🖥️ Настройка сервера для Git Workflow

## 📋 Что нужно сделать на сервере:

### 1. Подготовка

**Подключитесь к серверу:**
```bash
ssh root@91.219.237.178
```

### 2. Настройка Git репозитория

**Скопируйте скрипт на сервер:**
```bash
# На вашем локальном компьютере
scp setup-server-git.sh root@91.219.237.178:/home/
```

**Отредактируйте скрипт на сервере:**
```bash
# На сервере
nano /home/setup-server-git.sh
```

**Замените эти строки:**
```bash
GIT_REPO="https://github.com/yourusername/projtron01.git"  # ← ВАШ репозиторий
--email your-email@example.com  # ← ВАШ email
```

### 3. Запуск настройки

**Запустите скрипт:**
```bash
chmod +x /home/setup-server-git.sh
/home/setup-server-git.sh
```

## 🔧 Что делает скрипт:

1. **📦 Устанавливает пакеты:**
   - Git, Node.js, PM2, Nginx, Certbot

2. **📥 Клонирует репозиторий:**
   - `/home/projtron01/` - весь проект
   - `/home/projtron01/backend/` - бекенд

3. **🔧 Настраивает PM2:**
   - Запускает бекенд как сервис
   - Автозапуск при перезагрузке

4. **🌐 Настраивает Nginx:**
   - HTTPS с SSL сертификатом
   - Проксирование API на бекенд
   - Раздача статических файлов фронтенда

5. **🔥 Настраивает firewall:**
   - Открывает порты 22, 80, 443

6. **🔒 Получает SSL сертификат:**
   - Let's Encrypt для cryptoxchange.click

## 🚀 После настройки:

### Проверьте работу:
```bash
# Статус бекенда
pm2 status

# Логи бекенда
pm2 logs exchange-backend

# Статус Nginx
systemctl status nginx

# Проверьте сайт
curl -I https://cryptoxchange.click
```

### Деплой фронтенда:
```bash
# На вашем локальном компьютере
npm run deploy:frontend
```

## 🔄 Как работает обновление:

### Автоматическое (при push):
```bash
# На вашем компьютере
git add .
git commit -m "Изменения"
git push origin main
# → Сервер автоматически обновляется
```

### Ручное обновление на сервере:
```bash
# На сервере
cd /home/projtron01
./update-project.sh
```

## 📁 Структура на сервере:

```
/home/projtron01/          # Весь проект (Git)
├── backend/               # Бекенд
│   ├── server.js
│   ├── package.json
│   └── node_modules/
└── update-project.sh      # Скрипт обновления

/var/www/html/             # Фронтенд (копируется)
├── index.html
├── assets/
└── ...
```

## ✅ Готово!

После настройки:
- **Бекенд** обновляется автоматически при push
- **Фронтенд** деплоите командой `npm run deploy:frontend`
- **Сайт** доступен по адресу https://cryptoxchange.click 