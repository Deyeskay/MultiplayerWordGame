import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io("https://multiplayerwordgame.onrender.com");

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
  const [currentTurnId, setCurrentTurnId] = useState(null);
  const [hostId, setHostId] = useState(null);

  useEffect(() => {
    socket.on("room-update", updatedPlayers => {
      setPlayers(updatedPlayers);
      if (!hostId && updatedPlayers.length > 0) {
        setHostId(updatedPlayers[0].id);
      }
    });

    socket.on("your-word", ({ word, isFake }) => {
      setYourWord(word);
      setIsFake(isFake);
      setStep("in-game");
    });

    socket.on("all-words", setWords);
    socket.on("new-message", msg => setChat(prev => [...prev, msg]));
    socket.on("turn-update", ({ currentPlayerId }) => setCurrentTurnId(currentPlayerId));
    socket.on("game-ended", () => resetGame());

    return () => socket.off();
  }, []);

  function joinRoom() {
    if (!roomId || !playerName) return alert("Enter both fields");
    socket.emit("join-room", { roomId, playerName });
    setStep("lobby");
  }

  function startGame() {
    socket.emit("start-game", roomId);
  }

  function sendMessage() {
    if (!message) return;
    socket.emit("send-message", { roomId, playerName, message });
    setMessage("");
  }

  function leaveGame() {
    socket.emit("leave-room", { roomId });
    resetGame();
  }

  function endGame() {
    socket.emit("end-game", roomId);
    resetGame();
  }

  function resetGame() {
    setStep("join");
    setRoomId("");
    setPlayerName("");
    setPlayers([]);
    setYourWord("");
    setIsFake(false);
    setWords([]);
    setChat([]);
    setMessage("");
    setCurrentTurnId(null);
    setHostId(null);
  }

  const isYourTurn = currentTurnId === socket.id;
  const isHost = hostId === socket.id;

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 800, margin: "auto", padding: 20 }}>
      <h1>🎯 Multiplayer Word Game</h1>

      {/* Header */}
      {step !== "join" && (
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          borderBottom: "1px solid #ccc",
          paddingBottom: 10,
          marginBottom: 20
        }}>
          {/* Left: Player list */}
          <div>
            <h4>Players:</h4>
            <div style={{ display: 'flex', gap: 10 }}>
              {players.map(p => (
                <div key={p.id} style={{
                  padding: '5px 10px',
                  borderRadius: 6,
                  backgroundColor:
                    currentTurnId === p.id ? 'lightgreen' :
                    p.id === socket.id ? '#ddd' :
                    '#f0f0f0',
                  opacity: currentTurnId !== p.id ? 0.6 : 1,
                  fontWeight: p.id === socket.id ? 'bold' : 'normal'
                }}>
                  {p.name}
                </div>
              ))}
            </div>
          </div>

          {/* Right: You */}
          <div style={{ textAlign: "right" }}>
            <div><strong>👤 You:</strong> {playerName || "N/A"}</div>
            <div style={{ fontSize: 12, color: "#777" }}>Room: {roomId}</div>
          </div>
        </div>
      )}

      {/* Join Screen */}
      {step === "join" && (
        <>
          <input placeholder="Room ID" value={roomId} onChange={e => setRoomId(e.target.value)} />
          <input placeholder="Player Name" value={playerName} onChange={e => setPlayerName(e.target.value)} />
          <button onClick={joinRoom}>Join Room</button>
        </>
      )}

      {/* Lobby */}
      {step === "lobby" && (
        <>
          <h3>Waiting for players...</h3>
          <ul>{players.map(p => <li key={p.id}>{p.name}</li>)}</ul>
          {isHost && <button onClick={startGame}>Start Game</button>}
          <button onClick={leaveGame}>Exit Game</button>
        </>
      )}

      {/* In Game */}
      {step === "in-game" && (
        <>
          <div style={{ marginBottom: 20 }}>
            <h2>Your Word: <span style={{ color: isFake ? "red" : "green" }}>{yourWord}</span> — {isFake ? "Fake" : "Genuine"}</h2>

            <h3>Round Words:</h3>
            <div style={{ display: 'flex', gap: 15, flexWrap: 'wrap' }}>
              {words.map((w, i) => (
                <div key={i} style={{
                  padding: '5px 10px',
                  border: '1px solid #ccc',
                  borderRadius: 4,
                  backgroundColor: '#f9f9f9'
                }}>
                  {w}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <h3>Chat</h3>
            <div style={{
              border: "1px solid #ccc",
              padding: 10,
              height: 200,
              overflowY: "auto",
              backgroundColor: "#fff"
            }}>
              {chat.map((msg, i) => (
                <p key={i}><strong>{msg.playerName}:</strong> {msg.message}</p>
              ))}
            </div>
            <input
              style={{ width: "80%" }}
              placeholder="Type your hint..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              disabled={!isYourTurn}
            />
            <button onClick={sendMessage} disabled={!isYourTurn}>Send</button>
          </div>

          <div>
            <button onClick={leaveGame}>Exit Game</button>
            {isHost && <button onClick={endGame} style={{ marginLeft: 10, backgroundColor: "tomato", color: "white" }}>End Game</button>}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
