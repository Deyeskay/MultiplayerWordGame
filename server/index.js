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
  console.log('🔌 User connected:', socket.id);

  socket.on('join-room', ({ roomId, playerName }) => {
    console.log(`🚪 ${playerName} joining room ${roomId}`);
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = { players: [], gameStarted: false };
    }

    const player = {
      id: socket.id,
      name: playerName,
      word: null,
      isFake: false
    };

    // prevent duplicates
    if (!rooms[roomId].players.find(p => p.id === socket.id)) {
      rooms[roomId].players.push(player);
    }

    io.to(roomId).emit('room-update', rooms[roomId].players);
  });

  socket.on('start-game', (roomId) => {
    const players = rooms[roomId]?.players || [];
    const words = generateWords();

    players.forEach((player, index) => {
      const word = words[index];
      player.word = word;
      player.isFake = (word === "Laptop");

      // Send word privately
      io.to(player.id).emit('your-word', {
        word,
        isFake: player.isFake
      });
    });

    // Send word list to everyone
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
      const before = rooms[roomId].players.length;
      rooms[roomId].players = rooms[roomId].players.filter(p => p.id !== socket.id);
      const after = rooms[roomId].players.length;

      if (before !== after) {
        console.log(`❌ Player disconnected from ${roomId}`);
        io.to(roomId).emit('room-update', rooms[roomId].players);
      }

      // Optionally cleanup empty rooms
      if (rooms[roomId].players.length === 0) {
        delete rooms[roomId];
      }
    }
  });
});

server.listen(10000, () => {
  console.log('🚀 Server running on port 10000');
});
