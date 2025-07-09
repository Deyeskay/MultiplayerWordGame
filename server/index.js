const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const rooms = {}; // roomId: { players: [...], hostUUID, gameStarted, chat, turnIndex }

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

      // ✅ Restore game state if already started
      if (room.gameStarted) {
        io.to(socket.id).emit("your-word", {
          word: player.word,
          isFake: player.isFake
        });

        const currentPlayer = room.players[room.turnIndex];
        io.to(roomId).emit("turn-update", currentPlayer.name);

        // Optional: Send back all words for consistency
        io.to(socket.id).emit("all-words", room.players.map(p => p.word));
      }

    } else {
      // New join
      player = { uuid: playerUUID, name: playerName, socketId: socket.id, word: "", isFake: false };
      room.players.push(player);
      io.to(roomId).emit("player-joined", playerName);
    }

    // Update room and chat history
    io.to(roomId).emit("room-update", room.players); 
    
    // Wait 100ms to ensure frontend is ready to receive
    setTimeout(() => {
      io.to(socket.id).emit("chat-history", room.chat);
    }, 100);
 
  });

  socket.on("start-game", (roomId) => {
    const room = rooms[roomId];
    if (!room || room.players.length === 0) return;

    room.gameStarted = true;

    const shuffledWords = [...genuineWords, fakeWord].sort(() => 0.5 - Math.random()).slice(0, room.players.length);
    room.players.forEach((p, i) => {
      p.word = shuffledWords[i];
      p.isFake = (p.word === fakeWord);
      io.to(p.socketId).emit("your-word", { word: p.word, isFake: p.isFake });
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

  socket.on("leave-room", ({ roomId, playerUUID, playerName, socketId }) => {
    const room = rooms[roomId];
    if (!room) return;

    room.players = room.players.filter(p => p.uuid !== playerUUID);

    // Notify everyone except the leaving player
    socket.to(roomId).emit("player-left", { name: playerName, id: socketId });
    io.to(roomId).emit("room-update", room.players);

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
        // Keep in list; allow reconnection
        io.to(roomId).emit("room-update", room.players);
        break;
      }
    }
  });
});

server.listen(10000, () => {
  console.log('🚀 Server listening on port 10000');
});
