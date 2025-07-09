import React from 'react';

function Toast({ message }) {
  return (
    <div style={styles.toast}>
      {message}
    </div>
  );
}

const styles = {
  toast: {
    position: "fixed",
    bottom: 20,
    right: 20,
    background: "#333",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: 6,
    fontSize: 14,
    zIndex: 1000
  }
};

export default Toast;
