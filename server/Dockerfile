# Используем Node.js LTS
FROM node:20

# Рабочая директория внутри контейнера
WORKDIR /usr/src/app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь код сервера
COPY . .

# Переменные окружения берутся из .env
ENV PORT=5000

# Экспонируем порт
EXPOSE 5000

# Команда запуска сервера
CMD ["node", "src/index.js"]