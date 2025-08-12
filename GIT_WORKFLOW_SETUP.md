# 🚀 Git Workflow для удобного деплоя

## 📋 Что мы настроим:

1. **Автоматический деплой** через Git hooks
2. **Быстрые команды** для деплоя
3. **Удобное управление** фронтендом и бекендом
4. **Автоматическое обновление** на сервере

## 🌐 Шаг 1: Настройка Git репозитория

### 1.1 Создайте репозиторий на GitHub/GitLab
```bash
# Инициализируйте Git (если еще не сделано)
git init
git add .
git commit -m "Initial commit"

# Добавьте удаленный репозиторий
git remote add origin https://github.com/yourusername/projtron01.git
git branch -M main
git push -u origin main
```

### 1.2 Обновите setup-server.sh
Замените `yourusername` на ваше имя пользователя в GitHub:
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
chmod +x deploy.sh
chmod +x .git/hooks/post-commit
```

### 3.2 Настройте SSH ключи (если еще не настроены):
```bash
# Создайте SSH ключ
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Скопируйте ключ на сервер
ssh-copy-id root@91.219.237.178
```

## 🚀 Шаг 4: Использование

### 4.1 Быстрый деплой:
```bash
# Деплой всего проекта
npm run deploy

# Только фронтенд
npm run deploy:frontend

# Только бекенд
npm run deploy:backend
```

### 4.2 Автоматический деплой через Git:
```bash
# Просто сделайте коммит в main ветке
git add .
git commit -m "Обновление функционала"
# Автоматически запустится деплой!
```

### 4.3 Ручное обновление на сервере:
```bash
# На сервере
/home/update-project.sh
```

## 📝 Шаг 5: Рабочий процесс разработки

### 5.1 Обычная разработка:
```bash
# Создайте ветку для новой функции
git checkout -b feature/new-feature

# Разрабатывайте
npm run dev

# Тестируйте изменения
npm run build

# Когда готово - мержите в main
git checkout main
git merge feature/new-feature
git push origin main
# Автоматический деплой!
```

### 5.2 Быстрое исправление:
```bash
# Внесите изменения
# Сделайте коммит
git add .
git commit -m "Быстрое исправление"
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

# Обновление проекта
/home/update-project.sh
```

## ✅ Преимущества:

- **🚀 Быстрый деплой** - одна команда
- **🔄 Автоматизация** - деплой после коммита
- **🔧 Простое управление** - отдельно фронтенд/бекенд
- **📊 Мониторинг** - PM2 логи и статус
- **🛡️ Безопасность** - SSH ключи

## 🎉 Готово!

Теперь у вас есть полноценный Git workflow для удобной разработки и деплоя! 