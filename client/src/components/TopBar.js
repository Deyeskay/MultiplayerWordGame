import React from "react";

export default function TopBar({
  playerName,
  roomId,
  players,
  currentTurn,
  isHost,
  onExit,
  onEnd,
}) {
  return (
    <div style={styles.topBar}>
      <div style={styles.leftList}>
        {players.map((p) => (
          <span
            key={p.uuid}
            style={{
              ...styles.playerTag,
              backgroundColor: p.name === currentTurn ? "#4CAF50" : "#ddd",
              opacity: p.name === currentTurn ? 1 : 0.5,
            }}
          >
            {p.name}
          </span>
        ))}
      </div>

      <div style={styles.rightInfo}>
        <div>
          <strong>{playerName}</strong> <span role="img" aria-label="profile">👤</span>
        </div>
        <div style={styles.roomId}>Room ID: <strong>{roomId}</strong></div>
        <button onClick={onExit} style={styles.exitBtn}>Exit</button>
        {isHost && <button onClick={onEnd} style={styles.endBtn}>End</button>}
      </div>
    </div>
  );
}

const styles = {
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 20,
    alignItems: "center",
    flexWrap: "wrap",
  },
  leftList: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
  },
  playerTag: {
    padding: "6px 14px",
    borderRadius: 8,
    background: "#ddd",
    fontWeight: "bold",
    fontSize: 14,
  },
  rightInfo: {
    display: "flex",
    alignItems: "center",
    gap: 15,
  },
  roomId: {
    fontSize: 14,
    color: "#555",
  },
  exitBtn: {
    padding: "6px 12px",
    borderRadius: 6,
    border: "none",
    background: "#888",
    color: "white",
    fontSize: 14,
  },
  endBtn: {
    padding: "6px 12px",
    borderRadius: 6,
    border: "none",
    background: "#333",
    color: "white",
    fontSize: 14,
  }
};
