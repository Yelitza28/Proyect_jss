const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname));

// Middleware para parsear JSON
app.use(express.json());

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.broadcast.emit('user connected', 'Un usuario se ha conectado');

    socket.on('disconnect', () => {
        console.log('user disconnected');
        socket.broadcast.emit('user disconnected', 'Un usuario se ha desconectado');
    });

    socket.on('chat message', (msg) => {
        console.log('message: ', msg);
        io.emit('chat message', msg);
    });

    socket.on('typing', (username) => {
        socket.broadcast.emit('typing', username);
    });

    socket.on('stop typing', (username) => {
        socket.broadcast.emit('stop typing', username);
    });
});

// Ruta para manejar solicitudes POST a /chat
app.post('/chat', (req, res) => {
    const { username, message } = req.body;
    io.emit('chat message', { username, message });
    res.status(200).send('Mensaje enviado');
});

// Usar el puerto proporcionado por Render o 3000 como fallback
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});
