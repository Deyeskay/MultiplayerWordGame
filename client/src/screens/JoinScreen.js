import React, { useState } from 'react';
import { getOrCreateUUID } from '../utils/uuidHelper';
import socket from '../utils/socket';

function JoinScreen({ onJoin }) {
  const [roomId, setRoomId] = useState("");
  const [playerName, setPlayerName] = useState("");

  const handleJoin = () => {
    if (!roomId || !playerName) return;
    const playerUUID = getOrCreateUUID();
    localStorage.setItem("roomId", roomId);
    localStorage.setItem("playerName", playerName);
    socket.emit("join-room", { roomId, playerName, playerUUID });
    onJoin({ roomId, playerName });
  };

  return (
    <div>
      <h2>Join a Room</h2>
      <input placeholder="Room ID" value={roomId} onChange={e => setRoomId(e.target.value)} />
      <input placeholder="Your Name" value={playerName} onChange={e => setPlayerName(e.target.value)} />
      <button onClick={handleJoin}>Join</button>
    </div>
  );
}

export default JoinScreen;
