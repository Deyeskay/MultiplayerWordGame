import React from 'react';

export default function Modal({ message, onClose }) {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000
    }}>
      <div style={{ background: "#fff", padding: 20, borderRadius: 10 }}>
        <p>{message}</p>
        <button onClick={onClose}>OK</button>
      </div>
    </div>
  );
}
