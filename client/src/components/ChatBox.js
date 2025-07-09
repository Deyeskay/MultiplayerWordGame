import React from 'react';

export default function ChatBox({ chat }) {
  return (
    <div style={{ border: '1px solid #ccc', padding: 10, borderRadius: 5, height: 200, overflowY: 'auto', marginBottom: 10 }}>
      {chat.map((msg, i) => (
        <p key={i}><strong>{msg.playerName}:</strong> {msg.message}</p>
      ))}
    </div>
  );
}
