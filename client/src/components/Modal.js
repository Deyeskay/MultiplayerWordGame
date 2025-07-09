import React from 'react';

function Modal({ message, onClose }) {
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <p>{message}</p>
        <button onClick={onClose} style={styles.button}>OK</button>
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
    marginTop: 10,
    padding: "10px 20px",
    fontSize: 16,
    borderRadius: 5,
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none"
  }
};

export default Modal;
