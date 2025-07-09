import React from "react";

const TopBar = ({ playerName, players, currentTurn, roomId, onLeave, onEnd, isHost }) => {
  return (
    <div style={styles.topBar}>
      <div style={styles.left}>
        <div style={styles.title}>Multiplayer Word Game</div>
        <div>Room ID: <strong>{roomId}</strong></div>
        <div style={styles.players}>
          {players.map((p) => (
            <span
              key={p.uuid}
              style={{
                ...styles.playerTag,
                backgroundColor: p.name === currentTurn ? "#4CAF50" : "#ccc",
                opacity: p.name === currentTurn ? 1 : 0.5,
              }}
            >
              {p.name}
            </span>
          ))}
        </div>
      </div>

      <div style={styles.right}>
        <strong>{playerName}</strong> <span role="img" aria-label="profile">🧑‍💼</span>
        <button onClick={onLeave} style={styles.btn}>Exit</button>
        {isHost && <button onClick={onEnd} style={styles.btn}>End</button>}
      </div>
    </div>
  );
};

const styles = {
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    gap: 20,
    flexWrap: "wrap"
  },
  left: {
    display: "flex",
    flexDirection: "column",
    gap: 5
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: 10
  },
  players: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap"
  },
  playerTag: {
    padding: "5px 10px",
    borderRadius: 5,
    background: "#ccc",
    fontWeight: "bold"
  },
  btn: {
    padding: "6px 12px",
    borderRadius: 5,
    border: "none",
    background: "#888",
    color: "white"
  },
  title: {
    fontSize: 22,
    fontWeight: "bold"
  }
};

export default TopBar;
