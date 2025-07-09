import React from 'react';

function ConfirmDialog({ onConfirm, onCancel }) {
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <p>Are you sure?</p>
        <button onClick={onConfirm} style={{ ...styles.button, marginRight: 10 }}>Yes</button>
        <button onClick={onCancel} style={styles.exitSmall}>No</button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0, left: 0, bottom: 0, right: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999
  },
  modal: {
    background: "#fff",
    padding: 30,
    borderRadius: 8,
    textAlign: "center",
    maxWidth: 300
  },
  button: {
    padding: "10px 20px",
    fontSize: 16,
    borderRadius: 5,
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none"
  },
  exitSmall: {
    padding: "10px 20px",
    borderRadius: 5,
    border: "none",
    background: "#888",
    color: "white"
  }
};

export default ConfirmDialog;
