import React from 'react';

export default function PlayerList({ players, currentTurn }) {
  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      {players.map((p) => (
        <span key={p.uuid} style={{
          padding: '5px 10px',
          borderRadius: 5,
          backgroundColor: p.name === currentTurn ? '#4CAF50' : '#ccc',
          opacity: p.name === currentTurn ? 1 : 0.5
        }}>
          {p.name}
        </span>
      ))}
    </div>
  );
}
