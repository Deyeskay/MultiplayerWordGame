import React from 'react';

export default function LobbyScreen({ roomId, players, isHost, onStart, onExit }) {
  return (
    <div>
      <h3>Room ID: {roomId}</h3>
      <h4>Players:</h4>
      <ul>{players.map(p => <li key={p.uuid}>{p.name}</li>)}</ul>
      {isHost && <button onClick={onStart}>Start Game</button>}
      <button onClick={onExit}>Exit</button>
    </div>
  );
}
