# 🚀 Настройка Git Workflow

## 📋 Преимущества Git-based деплоя:

- ✅ **Быстро** - только изменённые файлы
- ✅ **Эффективно** - не копируем node_modules
- ✅ **Безопасно** - версионность и откат
- ✅ **Автоматизация** - деплой после push

## 🌐 Шаг 1: Настройка Git репозитория

### 1.1 Инициализируйте Git (если ещё не сделано):
```bash
git init
git add .
git commit -m "Initial commit"
```

### 1.2 Создайте репозиторий на GitHub/GitLab и добавьте remote:
```bash
git remote add origin https://github.com/yourusername/projtron01.git
git branch -M main
git push -u origin main
```

### 1.3 Обновите setup-server.sh:
Замените `yourusername` на ваше имя пользователя:
```bash
GIT_REPO="https://github.com/yourusername/projtron01.git"
```

## 🖥️ Шаг 2: Настройка сервера

### 2.1 Выполните на сервере:
```bash
# Скопируйте setup-server.sh на сервер
scp setup-server.sh root@91.219.237.178:/home/

# Подключитесь к серверу
ssh root@91.219.237.178

# Запустите настройку
chmod +x /home/setup-server.sh
/home/setup-server.sh
```

## 💻 Шаг 3: Настройка локальной разработки

### 3.1 Сделайте скрипты исполняемыми:
```bash
chmod +x deploy-git.sh
chmod +x .git/hooks/post-push
```

## 🚀 Шаг 4: Использование

### 4.1 Обычная разработка:
```bash
# Создайте ветку для новой функции
git checkout -b feature/new-feature

# Разрабатывайте
npm run dev

# Когда готово - мержите в main
git checkout main
git merge feature/new-feature
git push origin main
# Автоматический деплой!
```

### 4.2 Быстрый деплой:
```bash
# Деплой всего проекта
npm run deploy

# Только фронтенд
npm run deploy:frontend

# Только бекенд
npm run deploy:backend
```

### 4.3 Ручное обновление на сервере:
```bash
# На сервере
cd /home/projtron01
git pull origin main
cd backend
npm install
pm2 restart exchange-backend
```

## 📝 Шаг 5: Рабочий процесс

### 5.1 Разработка новой функции:
```bash
# 1. Создайте ветку
git checkout -b feature/new-feature

# 2. Разрабатывайте
# ... ваш код ...

# 3. Тестируйте локально
npm run dev

# 4. Коммитьте изменения
git add .
git commit -m "Добавлена новая функция"

# 5. Мержите в main
git checkout main
git merge feature/new-feature
git push origin main
# Автоматический деплой!
```

### 5.2 Быстрое исправление:
```bash
# 1. Внесите изменения
# 2. Коммитьте и пушите
git add .
git commit -m "Быстрое исправление"
git push origin main
# Автоматический деплой!
```

## 🔧 Управление на сервере:

```bash
# Статус приложений
pm2 status

# Логи бекенда
pm2 logs exchange-backend

# Перезапуск бекенда
pm2 restart exchange-backend

# Обновление из Git
cd /home/projtron01
git pull origin main
```

## ✅ Преимущества:

- **🚀 Быстро** - только изменённые файлы
- **🔄 Автоматизация** - деплой после push
- **🔧 Простое управление** - Git команды
- **📊 Версионность** - можно откатиться
- **🛡️ Безопасность** - история изменений

## 🎉 Готово!

Теперь у вас есть эффективный Git-based workflow для разработки и деплоя! 