import React from 'react';

export default function TopBar({ playerName, isHost, onLeave, onEnd }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
      <div><strong>{playerName}</strong> 👤</div>
      <div>
        <button onClick={onLeave} style={{ marginRight: 10 }}>Exit</button>
        {isHost && <button onClick={onEnd}>End</button>}
      </div>
    </div>
  );
}
