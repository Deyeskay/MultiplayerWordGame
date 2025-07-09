import React from 'react';

function LobbyScreen({ roomId, players, isHost, onStart, onExit }) {
  return (
    <div>
      <h2>Room ID: {roomId}</h2>
      <h3>Players:</h3>
      <ul>{players.map(p => <li key={p.uuid}>{p.name}</li>)}</ul>
      {isHost && <button onClick={onStart}>Start Game</button>}
      <button onClick={onExit}>Exit</button>
    </div>
  );
}

export default LobbyScreen;
