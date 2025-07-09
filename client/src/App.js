import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './index.css';
import { v4 as uuidv4 } from 'uuid';

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
  const [currentTurn, setCurrentTurn] = useState("");
  const [isHost, setIsHost] = useState(false);

  const [modalMsg, setModalMsg] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const playerUUID = getOrCreateUUID();

  function getOrCreateUUID() {
    let id = localStorage.getItem("playerUUID");
    if (!id) {
      id = uuidv4();
      localStorage.setItem("playerUUID", id);
    }
    return id;
  }

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

    socket.on("player-joined", ({ name, id }) => {
      if (id === socket.id) showToast("You joined the game");
      else showModalNow(`✅ ${name} joined the game.`);
    });

    socket.on("player-left", ({ name, id }) => {
      if (id === socket.id) {
        showToast("You left the game");
      } else {
        showModalNow(`⚠️ ${name} left the game.`);
      }
    });

    socket.on("player-rejoined", ({ name }) => {
      if (name !== playerName) {
        showModalNow(`🔄 ${name} rejoined the game.`);
      }
    });

    socket.on("game-ended", (hostName) => {
      const msg = hostName === playerName
        ? "⚠️ You ended the game."
        : `⚠️ Host ${hostName} ended the game.`;
      showModalNow(msg);
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

  const startGame = () => socket.emit("start-game", roomId);

  const sendMessage = () => {
    if (!message || playerName !== currentTurn) return;
    socket.emit("send-message", { roomId, playerName, message });
    setMessage("");
  };

  const confirmLeave = () => {
    setConfirmAction(() => () => {
      socket.emit("leave-room", { roomId, playerUUID, playerName });
      showToast("You left the game");
      resetGame();
    });
    setShowConfirm(true);
  };

  const confirmEnd = () => {
    setConfirmAction(() => () => {
      socket.emit("end-game", { roomId, hostName: playerName });
    });
    setShowConfirm(true);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const cancelConfirm = () => {
    setShowConfirm(false);
    setConfirmAction(null);
  };

  const proceedConfirm = () => {
    if (confirmAction) confirmAction();
    cancelConfirm();
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
          <button onClick={confirmLeave} style={styles.exitButton}>Exit</button>
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
              <button onClick={confirmLeave} style={styles.exitSmall}>Exit</button>
              {isHost && <button onClick={confirmEnd} style={styles.exitSmall}>End</button>}
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

      {showConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <p>Are you sure?</p>
            <button onClick={proceedConfirm} style={{ ...styles.button, marginRight: 10 }}>Yes</button>
            <button onClick={cancelConfirm} style={styles.exitSmall}>No</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  // same style block you already had, no change
};

export default App;
