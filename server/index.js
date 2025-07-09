const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

const rooms = {}; // { roomId: { players: [], gameStarted: false, currentTurn: 0, hostId } }

function generateWords() {
  const genuineWords = ["Apple", "Banana", "Mango", "Pineapple", "Orange"];
  const fakeWord = "Laptop";
  const allWords = [...genuineWords, fakeWord];
  return allWords.sort(() => Math.random() - 0.5);
}

io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  socket.on('join-room', ({ roomId, playerName }) => {
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = {
        players: [],
        gameStarted: false,
        currentTurn: 0,
        hostId: socket.id,
      };
    }

    const player = {
      id: socket.id,
      name: playerName,
      word: null,
      isFake: false,
    };

    // Add to player list
    rooms[roomId].players.push(player);

    // Notify all players
    io.to(roomId).emit('room-update', rooms[roomId].players);
  });

  socket.on('start-game', (roomId) => {
    const room = rooms[roomId];
    if (!room) return;

    const players = room.players;
    const words = generateWords();

    players.forEach((player, index) => {
      player.word = words[index];
      player.isFake = (words[index] === "Laptop");

      io.to(player.id).emit('your-word', {
        word: words[index],
        isFake: player.isFake,
      });
    });

    room.currentTurn = 0;
    room.gameStarted = true;

    io.to(roomId).emit('all-words', words);
    io.to(roomId).emit('room-update', room.players);
    io.to(roomId).emit('turn-update', {
      currentPlayerId: players[0].id,
    });
  });

  socket.on('send-message', ({ roomId, playerName, message }) => {
    const room = rooms[roomId];
    if (!room) return;

    // Broadcast chat message
    io.to(roomId).emit('new-message', { playerName, message });

    // Advance to next player
    if (room.players.length > 0) {
      room.currentTurn = (room.currentTurn + 1) % room.players.length;
      const nextPlayer = room.players[room.currentTurn];
      io.to(roomId).emit('turn-update', {
        currentPlayerId: nextPlayer.id,
      });
    }
  });

  socket.on('leave-room', ({ roomId }) => {
    socket.leave(roomId);
    if (!rooms[roomId]) return;

    rooms[roomId].players = rooms[roomId].players.filter(p => p.id !== socket.id);

    // If empty, delete room
    if (rooms[roomId].players.length === 0) {
      delete rooms[roomId];
    } else {
      io.to(roomId).emit('room-update', rooms[roomId].players);
    }
  });

  socket.on('end-game', (roomId) => {
    // Notify and clean up
    io.to(roomId).emit('game-ended');
    delete rooms[roomId];
  });

  socket.on('disconnect', () => {
    for (const roomId in rooms) {
      const room = rooms[roomId];
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);

        if (room.players.length === 0) {
          delete rooms[roomId];
        } else {
          io.to(roomId).emit('room-update', room.players);

          // If host left, assign new host
          if (room.hostId === socket.id) {
            room.hostId = room.players[0]?.id;
          }
        }
      }
    }
  });
});

server.listen(10000, () => {
  console.log('🚀 Server running on port 10000');
});
