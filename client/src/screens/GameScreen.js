import React from "react";
import TopBar from "../components/TopBar";
import WordDisplay from "../components/WordDisplay";
import ChatBox from "../components/ChatBox";
import InputBar from "../components/InputBar";

const GameScreen = ({
  roomId,
  playerName,
  players,
  yourWord,
  isFake,
  words,
  chat,
  message,
  currentTurn,
  onSendMessage,
  setMessage,
  onLeave,
  onEnd,
  isHost
}) => {
  return (
    <div className="screen-container">
      <TopBar
        roomId={roomId}
        playerName={playerName}
        players={players}
        currentTurn={currentTurn}
        onLeave={onLeave}
        onEnd={onEnd}
        isHost={isHost}
      />

      <WordDisplay word={yourWord} isFake={isFake} words={words} />

      <div className="chat-section">
        <h4>Chat:</h4>
        <ChatBox chat={chat} />
        <InputBar
          message={message}
          setMessage={setMessage}
          onSend={onSendMessage}
          disabled={playerName !== currentTurn}
        />
      </div>
    </div>
  );
};

export default GameScreen;
