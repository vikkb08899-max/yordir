# Используем Node.js 18 LTS
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json файлы
COPY package*.json ./
COPY backend/package*.json ./backend/

# Устанавливаем зависимости
RUN npm ci --only=production
RUN cd backend && npm ci --only=production

# Копируем исходный код
COPY . .

# Создаем директорию для логов
RUN mkdir -p logs

# Билдим фронтенд
RUN npm run build

# Устанавливаем PM2 глобально
RUN npm install -g pm2

# Открываем порт
EXPOSE 3000

# Запускаем приложение через PM2
CMD ["pm2-runtime", "start", "ecosystem.config.js", "--env", "production"] 