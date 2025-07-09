import React from 'react';

export default function InputBar({ value, onChange, onSend, disabled }) {
  return (
    <div>
      <input
        placeholder="Type your hint..."
        style={{ padding: 10, fontSize: 16, width: "80%", borderRadius: 5, border: "1px solid #ccc" }}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
      <button
        onClick={onSend}
        disabled={disabled}
        style={{
          marginLeft: 10,
          padding: "10px 20px",
          borderRadius: 5,
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? "not-allowed" : "pointer"
        }}
      >
        Send
      </button>
    </div>
  );
}
