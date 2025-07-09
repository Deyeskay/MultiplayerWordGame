// client/src/App.js
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io("https://multiplayerwordgame.onrender.com/"); // replace with your backend URL
console.log("🚀 App.js loaded");
function App() {
  const [step, setStep] = useState("join");
  const [roomId, setRoomId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [players, setPlayers] = useState([]);
  const [yourWord, setYourWord] = useState("");
  const [isFake, setIsFake] = useState(false);
  const [words, setWords] = useState([]);
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    socket.on("room-update", players => setPlayers(players));
    socket.on("your-word", ({word, isFake}) => {
      setYourWord(word);
      setIsFake(isFake);
      setStep("in-game");
    });
    socket.on("all-words", ws => setWords(ws));
    socket.on("new-message", msg => setChat(prev => [...prev, msg]));
    return () => socket.off();
  }, []);

  function joinRoom() {
    if (!roomId || !playerName) return alert("Enter both fields");
    socket.emit("join-room", {roomId, playerName});
    setStep("lobby");
  }

  function startGame() {
    socket.emit("start-game", roomId);
  }

  function sendMessage() {
    if (!message) return;
    socket.emit("send-message", {roomId, playerName, message});
    setMessage("");
  }

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", maxWidth: 600, margin: "auto" }}>
      <h1>MultiplayerWordGame</h1>

      {step === "join" && (
        <>
          <input placeholder="Room ID" value={roomId} onChange={e => setRoomId(e.target.value)} />
          <input placeholder="Player Name" value={playerName} onChange={e => setPlayerName(e.target.value)} />
          <button onClick={joinRoom}>Join Room</button>
        </>
      )}

      {step === "lobby" && (
        <>
          <h2>Room: {roomId}</h2>
          <h3>Players:</h3>
          <ul>{players.map(p => <li key={p.id}>{p.name}</li>)}</ul>
          <button onClick={startGame}>Start Game</button>
        </>
      )}

      {step === "in-game" && (
        <>
          <h2>Your Word: <strong>{yourWord}</strong> — {isFake ? "Fake" : "Genuine"}</h2>
          <h3>All Words This Round:</h3>
          <ul>{words.map((w, i) => <li key={i}>{w}</li>)}</ul>

          <div style={{ marginTop: 20 }}>
            <h3>Chat</h3>
            <div style={{ border: "1px solid #ccc", padding: 10, height: 200, overflowY: "auto" }}>
              {chat.map((msg, i) => (
                <p key={i}><strong>{msg.playerName}:</strong> {msg.message}</p>
              ))}
            </div>
            <input
              style={{ width: "80%" }}
              placeholder="Type your hint..."
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
