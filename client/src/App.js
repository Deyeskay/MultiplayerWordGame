import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './index.css';
import { v4 as uuidv4 } from 'uuid';

const socket = io("https://multiplayerwordgame.onrender.com/");

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
  const [currentTurn, setCurrentTurn] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState("");

  const getUUID = () => {
    let id = localStorage.getItem("playerUUID");
    if (!id) {
      id = uuidv4();
      localStorage.setItem("playerUUID", id);
    }
    return id;
  };
  const playerUUID = getUUID();

  useEffect(() => {
    socket.on("room-update", players => {
      setPlayers(players);
      if (players[0]?.uuid === playerUUID) setIsHost(true);
    });

    socket.on("your-word", ({ word, isFake }) => {
      setYourWord(word);
      setIsFake(isFake);
      setStep("in-game");
    });

    socket.on("all-words", setWords);
    socket.on("chat-history", setChat);
    socket.on("new-message", msg => setChat(prev => [...prev, msg]));
    socket.on("turn-update", name => setCurrentTurn(name));

    socket.on("player-joined", name => {
      if (name !== playerName) showModalNow(`✅ ${name} joined the game.`);
      else showToast("You joined the game.");
    });

    socket.on("player-left", name => showModalNow(`⚠️ ${name} left the game.`));
    socket.on("player-rejoined", name => showModalNow(`🔄 ${name} rejoined the game.`));

    socket.on("game-ended", () => {
      showModalNow("⚠️ Host ended the game.");
      setTimeout(() => resetGame(), 500);
    });

    return () => socket.off();
  }, [playerName]);

  const showModalNow = (msg) => {
    setModalMsg(msg);
    setShowModal(true);
  };

  const resetGame = () => {
    setStep("join");
    setPlayerName("");
    setRoomId("");
    setPlayers([]);
    setWords([]);
    setChat([]);
    setYourWord("");
    setIsFake(false);
    setCurrentTurn("");
    setIsHost(false);
  };

  const joinRoom = () => {
    if (!roomId || !playerName) return showModalNow("Enter Room ID and Name");
    socket.emit("join-room", { roomId, playerName, playerUUID });
    setStep("lobby");
  };

  const startGame = () => {
    socket.emit("start-game", roomId);
  };

  const sendMessage = () => {
    if (!message || playerName !== currentTurn) return;
    socket.emit("send-message", { roomId, playerName, message });
    setMessage("");
  };

  const endGame = () => {
    socket.emit("end-game", roomId);
  };

  const exitGame = () => {
    socket.emit("leave-room", { roomId, playerUUID, playerName });
    resetGame();
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  return (
    <div style={styles.container}>
      <h1>Multiplayer Word Game</h1>

      {step === "join" && (
        <>
          <input placeholder="Room ID" value={roomId} onChange={e => setRoomId(e.target.value)} style={styles.input} />
          <input placeholder="Your Name" value={playerName} onChange={e => setPlayerName(e.target.value)} style={styles.input} />
          <button onClick={joinRoom} style={styles.button}>Join Room</button>
        </>
      )}

      {step === "lobby" && (
        <>
          <h3>Room ID: {roomId}</h3>
          <h4>Players:</h4>
          <ul>{players.map(p => <li key={p.uuid}>{p.name}</li>)}</ul>
          {isHost && <button onClick={startGame} style={styles.button}>Start Game</button>}
          <button onClick={exitGame} style={styles.exitButton}>Exit</button>
        </>
      )}

      {step === "in-game" && (
        <>
          <div style={styles.topBar}>
            <div style={styles.leftList}>
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
            <div style={styles.rightInfo}>
              <strong>{playerName}</strong> 👤
              <button onClick={exitGame} style={styles.exitSmall}>Exit</button>
              {isHost && <button onClick={endGame} style={styles.exitSmall}>End</button>}
            </div>
          </div>

          <h3>Your Word: <strong>{yourWord}</strong> — {isFake ? "Fake" : "Genuine"}</h3>
          <div style={styles.wordRow}>
            {words.map((w, i) => <div key={i} style={styles.wordBox}>{w}</div>)}
          </div>

          <h4>Chat:</h4>
          <div style={styles.chatBox}>
            {chat.map((msg, i) => (
              <p key={i}><strong>{msg.playerName}:</strong> {msg.message}</p>
            ))}
          </div>

          <input
            placeholder="Type your hint..."
            style={styles.input}
            value={message}
            onChange={e => setMessage(e.target.value)}
            disabled={playerName !== currentTurn}
          />
          <button
            onClick={sendMessage}
            disabled={playerName !== currentTurn}
            style={{
              ...styles.button,
              opacity: playerName !== currentTurn ? 0.5 : 1,
              cursor: playerName !== currentTurn ? "not-allowed" : "pointer"
            }}
          >
            Send
          </button>
        </>
      )}

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <p>{modalMsg}</p>
            <button onClick={() => setShowModal(false)} style={styles.button}>OK</button>
          </div>
        </div>
      )}

      {toast && <div style={styles.toast}>{toast}</div>}
    </div>
  );
}

const styles = {
  container: {
    padding: 20,
    fontFamily: "Segoe UI, sans-serif",
    maxWidth: 700,
    margin: "auto"
  },
  input: {
    padding: 10,
    margin: "5px 0",
    width: "100%",
    fontSize: 16,
    borderRadius: 5,
    border: "1px solid #ccc"
  },
  button: {
    padding: "10px 20px",
    fontSize: 16,
    marginTop: 10,
    borderRadius: 5,
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none"
  },
  exitButton: {
    marginTop: 10,
    backgroundColor: "#f44336",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: 5,
    border: "none"
  },
  exitSmall: {
    marginLeft: 10,
    padding: "6px 12px",
    borderRadius: 5,
    border: "none",
    background: "#888",
    color: "white"
  },
  chatBox: {
    border: "1px solid #ccc",
    borderRadius: 5,
    padding: 10,
    height: 200,
    overflowY: "auto",
    marginBottom: 10,
    background: "#fafafa"
  },
  wordRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 15
  },
  wordBox: {
    padding: "10px 20px",
    borderRadius: 5,
    background: "#eee",
    border: "1px solid #ccc"
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 20
  },
  leftList: {
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
  rightInfo: {
    display: "flex",
    alignItems: "center",
    gap: 10
  },
  modalOverlay: {
    position: "fixed",
    top: 0, left: 0, bottom: 0, right: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999
  },
  modal: {
    background: "#fff",
    padding: 30,
    borderRadius: 8,
    textAlign: "center",
    maxWidth: 300
  },
  toast: {
    position: "fixed",
    bottom: 20,
    right: 20,
    background: "#333",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: 6,
    fontSize: 14,
    zIndex: 1000
  }
};

export default App;
