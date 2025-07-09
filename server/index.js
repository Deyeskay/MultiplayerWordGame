const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const rooms = {}; // { roomId: { players: [{ uuid, name, socketId }], hostUUID, gameStarted, chat } }
const genuineWords = ["Apple", "Banana", "Mango", "Pineapple", "Orange"];
const fakeWord = "Laptop";

io.on('connection', (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("join-room", ({ roomId, playerName, playerUUID }) => {
    socket.join(roomId);
    if (!rooms[roomId]) {
      rooms[roomId] = {
        players: [],
        hostUUID: playerUUID,
        gameStarted: false,
        chat: [],
        turnIndex: 0
      };
    }

    const room = rooms[roomId];

    let player = room.players.find(p => p.uuid === playerUUID);
    if (player) {
      // Rejoin
      player.socketId = socket.id;
      io.to(roomId).emit("player-rejoined", player.name);
    } else {
      // New join
      player = { uuid: playerUUID, name: playerName, socketId: socket.id, word: "", isFake: false };
      room.players.push(player);
      io.to(roomId).emit("player-joined", playerName);
    }

    // Update room
    io.to(roomId).emit("room-update", room.players);
    io.to(socket.id).emit("chat-history", room.chat);
  });

  socket.on("start-game", (roomId) => {
    const room = rooms[roomId];
    if (!room || room.players.length === 0) return;

    room.gameStarted = true;

    const shuffledWords = [...genuineWords, fakeWord].sort(() => 0.5 - Math.random()).slice(0, room.players.length);

    room.players.forEach((p, index) => {
      p.word = shuffledWords[index];
      p.isFake = p.word === fakeWord;

      io.to(p.socketId).emit("your-word", {
        word: p.word,
        isFake: p.isFake
      });
    });

    io.to(roomId).emit("all-words", room.players.map(p => p.word));

    // Start turn sequence
    room.turnIndex = 0;
    const currentPlayer = room.players[room.turnIndex];
    io.to(roomId).emit("turn-update", currentPlayer.name);
  });

  socket.on("send-message", ({ roomId, playerName, message }) => {
    const room = rooms[roomId];
    if (!room) return;

    const chatMsg = { playerName, message };
    room.chat.push(chatMsg);
    io.to(roomId).emit("new-message", chatMsg);

    // Advance turn
    room.turnIndex = (room.turnIndex + 1) % room.players.length;
    const nextPlayer = room.players[room.turnIndex];
    io.to(roomId).emit("turn-update", nextPlayer.name);
  });

  socket.on("leave-room", ({ roomId, playerUUID, playerName }) => {
    const room = rooms[roomId];
    if (!room) return;

    // Remove player
    room.players = room.players.filter(p => p.uuid !== playerUUID);

    // Update others
    io.to(roomId).emit("player-left", playerName);
    io.to(roomId).emit("room-update", room.players);

    // Clean up empty room
    if (room.players.length === 0) {
      delete rooms[roomId];
    }
  });

  socket.on("end-game", ({ roomId, hostName }) => {
    const room = rooms[roomId];
    if (!room) return;

    io.to(roomId).emit("game-ended", hostName);
    delete rooms[roomId];
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);

    for (const roomId in rooms) {
      const room = rooms[roomId];
      const player = room.players.find(p => p.socketId === socket.id);
      if (player) {
        // Don't remove from room immediately (they may rejoin)
        io.to(roomId).emit("room-update", room.players);
        break;
      }
    }
  });
});

server.listen(10000, () => {
  console.log('🚀 Server listening on port 10000');
});
