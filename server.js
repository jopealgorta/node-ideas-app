require('dotenv').config();
const mongoose = require('mongoose');
const http = require('http');
const sockets = require('socket.io');
const formatMessage = require('./utils/messages');
const Message = require('./models/messageModel');

process.on('uncaughtException', err => {
    console.error(err.name, err.message);
    process.exit(1);
});

const app = require('./app');

const server = http.createServer(app);
const io = sockets(server);

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
    .connect(DB, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
    .then(() => console.log('DB connected successfully!'))
    .catch(err => console.error(err));

const botName = 'IdeApp Bot';

io.on('connection', socket => {
    socket.on('joinRoom', async ({ userId, username, room }) => {
        socket.userId = userId;
        socket.username = username;
        socket.room = room;
        socket.join(room);
        socket.emit(
            'loadMessages',
            await Message.find({ idea: room })
                .select('-_id -__v')
                .populate({ path: 'from', select: 'name' })
        );
        socket.emit('message', formatMessage(botName, 'Bienvenido a la discusion!'));
        socket.broadcast.to(room).emit('message', formatMessage(botName, `${username} has joined the chat`));
    });

    socket.on('chatMessage', async msg => {
        const message = {
            from: socket.userId,
            idea: socket.room,
            message: msg
        };
        await Message.create(message);
        io.to(socket.room).emit('message', formatMessage(socket.username, message.message));
    });

    socket.on('disconnect', () => {
        io.to(socket.room).emit('message', formatMessage(botName, `${socket.username} has left the chat`));
    });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
    // Unhandled promise rejections
    console.error(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

process.on('SIGTERM', () => {
    console.error('SIGTERM received, shutting down the server...');
    server.close(() => {
        console.log('Process terminated!');
    });
});
