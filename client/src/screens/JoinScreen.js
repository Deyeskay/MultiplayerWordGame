import React, { useState } from 'react';
import socket from '../utils/socket';
import { getOrCreateUUID } from '../utils/uuidHelper';

export default function JoinScreen({ onJoin }) {
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');

  const handleJoin = () => {
    const uuid = getOrCreateUUID();
    if (roomId && playerName) {
      socket.emit("join-room", { roomId, playerName, playerUUID: uuid });
      localStorage.setItem("roomId", roomId);
      localStorage.setItem("playerName", playerName);
      onJoin({ roomId, playerName });
    }
  };

  return (
    <div>
      <h2>Join Room</h2>
      <input value={roomId} onChange={e => setRoomId(e.target.value)} placeholder="Room ID" />
      <input value={playerName} onChange={e => setPlayerName(e.target.value)} placeholder="Your Name" />
      <button onClick={handleJoin}>Join</button>
    </div>
  );
}
