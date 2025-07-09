import React from 'react';

export default function WordDisplay({ word, isFake, words }) {
  return (
    <div>
      <h3>Your Word: <strong>{word}</strong> — {isFake ? "Fake" : "Genuine"}</h3>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 15 }}>
        {words.map((w, i) => (
          <div key={i} style={{ padding: '10px 20px', borderRadius: 5, background: '#eee', border: '1px solid #ccc' }}>
            {w}
          </div>
        ))}
      </div>
    </div>
  );
}
