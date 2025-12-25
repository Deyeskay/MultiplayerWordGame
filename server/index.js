import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", ({ username, roomId }) => {
    socket.join(roomId);
    socket.username = username;
    socket.roomId = roomId;

    socket.to(roomId).emit("system-message", {
      message: `${username} joined the room`
    });
  });

  socket.on("send-message", (message) => {
    if (!socket.roomId) return;

    io.to(socket.roomId).emit("chat-message", {
      username: socket.username,
      message
    });
  });

  socket.on("disconnect", () => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit("system-message", {
        message: `${socket.username} left the room`
      });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
