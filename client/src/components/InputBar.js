import React from 'react';

function InputBar({ message, onChange, onSend, isDisabled }) {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <input
        style={styles.input}
        placeholder="Type your hint..."
        value={message}
        onChange={onChange}
        disabled={isDisabled}
      />
      <button
        onClick={onSend}
        disabled={isDisabled}
        style={{
          ...styles.button,
          opacity: isDisabled ? 0.5 : 1,
          cursor: isDisabled ? "not-allowed" : "pointer"
        }}
      >
        Send
      </button>
    </div>
  );
}

const styles = {
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    border: "1px solid #ccc",
    fontSize: 16
  },
  button: {
    padding: "10px 20px",
    fontSize: 16,
    borderRadius: 5,
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none"
  }
};

export default InputBar;
