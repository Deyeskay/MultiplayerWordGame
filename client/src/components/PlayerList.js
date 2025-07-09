import React from 'react';

function PlayerList({ players, currentTurn }) {
  return (
    <div style={styles.container}>
      {players.map((p) => (
        <span
          key={p.uuid}
          style={{
            ...styles.tag,
            backgroundColor: p.name === currentTurn ? "#4CAF50" : "#ccc",
            opacity: p.name === currentTurn ? 1 : 0.6
          }}
        >
          {p.name}
        </span>
      ))}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 15
  },
  tag: {
    padding: "6px 12px",
    borderRadius: 6,
    fontWeight: "bold"
  }
};

export default PlayerList;
