import React from 'react';

function TopBar({ roomId, playerName, isHost, onLeave, onEnd }) {
  return (
    <div style={styles.topBar}>
      <div style={styles.left}>Room: <strong>{roomId}</strong></div>
      <div style={styles.right}>
        <span>👤 <strong>{playerName}</strong></span>
        <button onClick={onLeave} style={styles.btn}>Exit</button>
        {isHost && <button onClick={onEnd} style={styles.btn}>End</button>}
      </div>
    </div>
  );
}

const styles = {
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10,
    padding: 10,
    background: "#f0f0f0",
    borderRadius: 5
  },
  left: {
    fontSize: 14
  },
  right: {
    display: "flex",
    gap: 10,
    alignItems: "center"
  },
  btn: {
    backgroundColor: "#888",
    color: "white",
    border: "none",
    borderRadius: 4,
    padding: "6px 10px",
    cursor: "pointer"
  }
};

export default TopBar;
