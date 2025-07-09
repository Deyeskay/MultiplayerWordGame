import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io("https://multiplayerwordgame.onrender.com/"); // change this later

function App() {
  const [roomId, setRoomId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [joined, setJoined] = useState(false);
  const [players, setPlayers] = useState([]);
  const [yourWord, setYourWord] = useState("");
  const [isFake, setIsFake] = useState(false);
  const [words, setWords] = useState([]);
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");

  const joinRoom = () => {
    socket.emit("join-room", { roomId, playerName });
    setJoined(true);
  };

  const startGame = () => {
    socket.emit("start-game", roomId);
  };

  const sendMessage = () => {
    socket.emit("send-message", { roomId, playerName, message });
    setMessage("");
  };

  useEffect(() => {
    socket.on("room-update", setPlayers);
    socket.on("your-word", ({ word, isFake }) => {
      setYourWord(word);
      setIsFake(isFake);
    });
    socket.on("all-words", setWords);
    socket.on("new-message", (msg) => setChat(prev => [...prev, msg]));
  }, []);

  if (!joined) {
    return (
      <div>
        <h1>Join Game</h1>
        <input placeholder="Room ID" onChange={(e) => setRoomId(e.target.value)} />
        <input placeholder="Your Name" onChange={(e) => setPlayerName(e.target.value)} />
        <button onClick={joinRoom}>Join</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Room: {roomId}</h1>
      <h2>Players:</h2>
      <ul>{players.map(p => <li key={p.id}>{p.name}</li>)}</ul>
      <button onClick={startGame}>Start Game</button>

      <h2>Your Word: {yourWord} - {isFake ? "Fake" : "Genuine"}</h2>
      <h2>All Words:</h2>
      <ul>{words.map((w, i) => <li key={i}>{w}</li>)}</ul>

      <div>
        <h2>Chat</h2>
        {chat.map((msg, i) => (
          <p key={i}><strong>{msg.playerName}:</strong> {msg.message}</p>
        ))}
        <input value={message} onChange={e => setMessage(e.target.value)} />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;
