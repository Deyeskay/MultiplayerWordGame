import React, { useEffect, useState } from 'react';
import JoinScreen from './screens/JoinScreen';
import LobbyScreen from './screens/LobbyScreen';
import GameScreen from './screens/GameScreen';
import socket from './utils/socket';
import { getOrCreateUUID } from './utils/uuidHelper';
import Modal from './components/Modal';
import Toast from './components/Toast';
import ConfirmDialog from './components/ConfirmDialog';

function App() {
  const [step, setStep] = useState("join");
  const [roomId, setRoomId] = useState(localStorage.getItem("roomId") || "");
  const [playerName, setPlayerName] = useState(localStorage.getItem("playerName") || "");
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
      if (name === playerName) showToast("You joined the game");
      else showModalNow(`✅ ${name} joined the game.`);
    });

    socket.on("player-rejoined", name => {
      if (name !== playerName) showModalNow(`🔄 ${name} rejoined the game.`);
    });

    socket.on("player-left", ({ name, id }) => {
      if (socket.id === id) showToast("You left the game");
      else showModalNow(`⚠️ ${name} left the game.`);
    });

    socket.on("game-ended", (hostName) => {
      const msg = hostName === playerName
        ? "⚠️ You ended the game."
        : `⚠️ Host ${hostName} ended the game.`;
      showModalNow(msg);
      setTimeout(() => resetGame(), 1000);
    });

    if (roomId && playerName) {
      socket.emit("join-room", { roomId, playerName, playerUUID });
      setStep("lobby");
    }

    return () => socket.off();
  }, [playerName]);

  const showModalNow = (msg) => {
    setModalMsg(msg);
    setShowModal(true);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
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
    localStorage.removeItem("roomId");
    localStorage.removeItem("playerName");
  };

  const joinHandler = ({ roomId, playerName }) => {
    setRoomId(roomId);
    setPlayerName(playerName);
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
      socket.emit("leave-room", { roomId, playerUUID, playerName, socketId: socket.id });
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

  const proceedConfirm = () => {
    if (confirmAction) confirmAction();
    setShowConfirm(false);
  };

  const cancelConfirm = () => {
    setShowConfirm(false);
    setConfirmAction(null);
  };

  return (
    <div style={{ padding: 20 }}>
      {step === "join" && <JoinScreen onJoin={joinHandler} />}
      {step === "lobby" && (
        <LobbyScreen
          roomId={roomId}
          players={players}
          isHost={isHost}
          onStart={startGame}
          onExit={confirmLeave}
        />
      )}
      {step === "in-game" && yourWord && words.length > 0 && (
        <GameScreen
          playerName={playerName}
          currentTurn={currentTurn}
          word={yourWord}
          isFake={isFake}
          words={words}
          chat={chat}
          message={message}
          onMessageChange={(e) => setMessage(e.target.value)}
          onSend={sendMessage}
          onLeave={confirmLeave}
          onEnd={confirmEnd}
          isHost={isHost}
          players={players}
        />
      )}

      {showModal && <Modal message={modalMsg} onClose={() => setShowModal(false)} />}
      {toast && <Toast message={toast} />}
      {showConfirm && <ConfirmDialog onConfirm={proceedConfirm} onCancel={cancelConfirm} />}
    </div>
  );
}

export default App;
