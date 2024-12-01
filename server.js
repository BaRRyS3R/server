"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
// Создаем приложение Express
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// Инициализируем Socket.IO сервер
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*", // Настройте для продакшена
        methods: ["GET", "POST"]
    }
});
// Хранилище подключенных игроков
let players = {};
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
// Запуск сервера
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Сервер слушает на порту ${PORT}`);
});
