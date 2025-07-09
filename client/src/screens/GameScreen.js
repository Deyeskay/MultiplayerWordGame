import React from "react";
import ChatBox from "../components/ChatBox";
import WordDisplay from "../components/WordDisplay";
import InputBar from "../components/InputBar";
import TopBar from "../components/TopBar";

export default function GameScreen({
  playerName,
  roomId,
  isHost,
  players,
  currentTurn,
  yourWord,
  isFake,
  words,
  chat,
  message,
  setMessage,
  onSend,
  onExit,
  onEnd,
}) {
  return (
    <>
      <TopBar
        playerName={playerName}
        roomId={roomId}
        players={players}
        currentTurn={currentTurn}
        isHost={isHost}
        onExit={onExit}
        onEnd={onEnd}
      />

      <h3 style={{ marginBottom: 8 }}>
        Your Word: <strong>{yourWord}</strong> — {isFake ? "Fake" : "Genuine"}
      </h3>

      <WordDisplay words={words} />

      <h4 style={{ marginTop: 20 }}>Chat:</h4>
      <ChatBox chat={chat} />

      <InputBar
        message={message}
        setMessage={setMessage}
        onSend={onSend}
        disabled={playerName !== currentTurn}
      />
    </>
  );
}
