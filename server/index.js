const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

const rooms = {}; // Room state

function generateWords() {
  const genuineWords = ["Apple", "Banana", "Mango", "Pineapple", "Orange"];
  const fakeWord = "Laptop";
  const allWords = [...genuineWords, fakeWord];
  return allWords.sort(() => Math.random() - 0.5);
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", ({ roomId, playerName }) => {
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = {
        players: [],
        chat: [],
        gameStarted: false,
        hostId: socket.id,
        currentTurnIndex: 0,
        words: [],
      };
    }

    const room = rooms[roomId];
    let existing = room.players.find((p) => p.name === playerName);

    if (!existing) {
      const player = {
        id: socket.id,
        name: playerName,
        word: null,
        isFake: false,
      };
      room.players.push(player);
      io.to(roomId).emit("player-joined", playerName);
    } else {
      existing.id = socket.id;
      io.to(roomId).emit("player-rejoined", playerName);
    }

    io.to(roomId).emit("room-update", room.players);
    socket.emit("chat-history", room.chat);

    if (room.gameStarted) {
      const currentPlayer = room.players[room.currentTurnIndex];
      socket.emit("your-word", {
        word: existing?.word,
        isFake: existing?.isFake,
      });
      socket.emit("all-words", room.words);
      io.to(roomId).emit("turn-update", currentPlayer?.name);
    }
  });

  socket.on("start-game", (roomId) => {
    const room = rooms[roomId];
    if (!room || room.players.length < 2) return;

    const words = generateWords();
    room.words = words;
    room.players.forEach((p, i) => {
      p.word = words[i];
      p.isFake = words[i] === "Laptop";
      io.to(p.id).emit("your-word", {
        word: p.word,
        isFake: p.isFake,
      });
    });

    room.gameStarted = true;
    room.currentTurnIndex = 0;
    io.to(roomId).emit("all-words", words);
    io.to(roomId).emit("turn-update", room.players[0].name);
  });

  socket.on("send-message", ({ roomId, playerName, message }) => {
    const room = rooms[roomId];
    if (!room) return;

    const msg = { playerName, message };
    room.chat.push(msg);
    io.to(roomId).emit("new-message", msg);

    // Advance turn
    if (room.gameStarted) {
      room.currentTurnIndex = (room.currentTurnIndex + 1) % room.players.length;
      const nextPlayer = room.players[room.currentTurnIndex];
      io.to(roomId).emit("turn-update", nextPlayer.name);
    }
  });

  socket.on("vote", ({ roomId, votedPlayer }) => {
    io.to(roomId).emit("vote-update", votedPlayer);
  });

  socket.on("end-game", (roomId) => {
    const room = rooms[roomId];
    if (!room) return;
    io.to(roomId).emit("game-ended");
    delete rooms[roomId];
  });

  socket.on("leave-room", ({ roomId, playerName }) => {
    const room = rooms[roomId];
    if (!room) return;
    room.players = room.players.filter((p) => p.id !== socket.id);
    io.to(roomId).emit("room-update", room.players);
    io.to(roomId).emit("player-left", playerName);
  });

  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      const room = rooms[roomId];
      const leavingPlayer = room.players.find((p) => p.id === socket.id);
      if (!leavingPlayer) continue;

      room.players = room.players.filter((p) => p.id !== socket.id);
      io.to(roomId).emit("room-update", room.players);

      if (socket.id === room.hostId) {
        io.to(roomId).emit("game-ended");
        delete rooms[roomId];
      } else {
        io.to(roomId).emit("player-left", leavingPlayer.name);
      }
    }
  });
});

server.listen(10000, () => {
  console.log("Server running on port 10000");
});
