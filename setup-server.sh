#!/bin/bash

# Скрипт для настройки сервера с Git workflow
# Выполняется на сервере

set -e

PROJECT_PATH="/home/projtron01"
GIT_REPO="https://github.com/yourusername/projtron01.git"  # Замените на ваш репозиторий

echo "🚀 Настройка сервера для Git workflow..."

# Создаем директорию проекта
mkdir -p $PROJECT_PATH
cd $PROJECT_PATH

# Клонируем репозиторий (если еще не клонирован)
if [ ! -d ".git" ]; then
    echo "📥 Клонируем репозиторий..."
    git clone $GIT_REPO .
    git checkout main
else
    echo "📥 Обновляем репозиторий..."
    git fetch origin
    git reset --hard origin/main
fi

# Устанавливаем зависимости
echo "📦 Устанавливаем зависимости..."
cd backend
npm install

# Настраиваем PM2
echo "🔧 Настраиваем PM2..."
npm install -g pm2

# Создаем PM2 конфигурацию
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'exchange-backend',
    script: 'server.js',
    cwd: '/home/projtron01/backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

# Запускаем бекенд через PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Создаем скрипт для автоматического обновления
cat > /home/update-project.sh << 'EOF'
#!/bin/bash
cd /home/projtron01
git pull origin main
cd backend
npm install
pm2 restart exchange-backend
echo "✅ Проект обновлен!"
EOF

chmod +x /home/update-project.sh

echo "✅ Сервер настроен!"
echo "📋 Команды для управления:"
echo "  - Обновить проект: /home/update-project.sh"
echo "  - Статус PM2: pm2 status"
echo "  - Логи: pm2 logs exchange-backend" 