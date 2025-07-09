const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

const rooms = {};

function generateWords() {
  const genuineWords = ["Apple", "Banana", "Mango", "Pineapple", "Orange"];
  const fakeWord = "Laptop";
  const allWords = [...genuineWords, fakeWord];
  return allWords.sort(() => Math.random() - 0.5);
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', ({ roomId, playerName }) => {
    socket.join(roomId);
    if (!rooms[roomId]) {
      rooms[roomId] = {
        players: [],
        gameStarted: false
      };
    }

    const player = { id: socket.id, name: playerName, word: null, isFake: false };
    rooms[roomId].players.push(player);

    io.to(roomId).emit('room-update', rooms[roomId].players);
  });

  socket.on('start-game', (roomId) => {
    const players = rooms[roomId].players;
    const words = generateWords();
    for (let i = 0; i < players.length; i++) {
      players[i].word = words[i];
      players[i].isFake = (words[i] === "Laptop");
      io.to(players[i].id).emit('your-word', {
        word: words[i],
        isFake: players[i].isFake
      });
    }

    io.to(roomId).emit('all-words', words);
  });

  socket.on('send-message', ({ roomId, playerName, message }) => {
    io.to(roomId).emit('new-message', { playerName, message });
  });

  socket.on('vote', ({ roomId, votedPlayer }) => {
    io.to(roomId).emit('vote-update', votedPlayer);
  });

  socket.on('disconnect', () => {
    for (const roomId in rooms) {
      rooms[roomId].players = rooms[roomId].players.filter(p => p.id !== socket.id);
      io.to(roomId).emit('room-update', rooms[roomId].players);
    }
  });
});

server.listen(10000, () => {
  console.log('Server running on port 10000');
});
