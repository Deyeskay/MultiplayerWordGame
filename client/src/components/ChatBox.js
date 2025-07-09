import React from 'react';

function ChatBox({ chat }) {
  return (
    <div style={styles.chatBox}>
      {chat.map((msg, i) => (
        <p key={i}><strong>{msg.playerName}:</strong> {msg.message}</p>
      ))}
    </div>
  );
}

const styles = {
  chatBox: {
    border: "1px solid #ccc",
    borderRadius: 5,
    padding: 10,
    height: 200,
    overflowY: "auto",
    background: "#fafafa",
    marginBottom: 10
  }
};

export default ChatBox;
