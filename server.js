// server.js

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

// Создаём приложение Express
const app = express();
const server = http.createServer(app);

// Инициализируем Socket.IO сервер
const io = new Server(server, {
  cors: {
    origin: "*", // Замените "*" на ваш домен в продакшене для безопасности
    methods: ["GET", "POST"]
  }
});

// Хранилище подключённых игроков
let players = {};

// Обработка подключений
io.on('connection', (socket) => {
  console.log(`Пользователь подключился: ${socket.id}`);

  // Обработка события ping от клиента
  socket.on('ping', () => {
    socket.emit('pong');
  });

  // Когда новый игрок присоединяется
  socket.on('newPlayer', (playerInfo) => {
    players[socket.id] = playerInfo;
    io.emit('updatePlayers', players);
  });

  // Когда игрок двигается
  socket.on('playerMovement', (movementData) => {
    if (players[socket.id]) {
      players[socket.id].x = movementData.x;
      players[socket.id].y = movementData.y;
      io.emit('updatePlayers', players);
    }
  });

  // Когда игрок отключается
  socket.on('disconnect', () => {
    console.log(`Пользователь отключился: ${socket.id}`);
    delete players[socket.id];
    io.emit('updatePlayers', players);
  });
});

// Маршрут для проверки работоспособности сервера
app.get('/', (req, res) => {
  res.send('Socket.IO сервер работает!');
});

// Определяем порт из переменных окружения или по умолчанию
const PORT = process.env.PORT || 3000;

// Запуск сервера
server.listen(PORT, () => {
  console.log(`Сервер слушает на порту ${PORT}`);
});
