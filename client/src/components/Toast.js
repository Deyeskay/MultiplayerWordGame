import React from 'react';

export default function Toast({ message }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      background: '#333',
      color: '#fff',
      padding: '10px 20px',
      borderRadius: 6,
      fontSize: 14,
      zIndex: 1000
    }}>
      {message}
    </div>
  );
}
