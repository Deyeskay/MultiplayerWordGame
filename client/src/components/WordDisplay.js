import React from 'react';

function WordDisplay({ word, isFake, words }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h3>Your Word: <strong>{word}</strong> — {isFake ? "Fake" : "Genuine"}</h3>
      <div style={styles.wordRow}>
        {words.map((w, i) => (
          <div key={i} style={styles.wordBox}>{w}</div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  wordRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10
  },
  wordBox: {
    padding: "10px 20px",
    borderRadius: 5,
    background: "#eee",
    border: "1px solid #ccc"
  }
};

export default WordDisplay;
