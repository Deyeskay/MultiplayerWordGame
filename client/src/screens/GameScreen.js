import React from 'react';
import TopBar from '../components/TopBar';
import PlayerList from '../components/PlayerList';
import WordDisplay from '../components/WordDisplay';
import ChatBox from '../components/ChatBox';
import InputBar from '../components/InputBar';

const GameScreen = ({
  playerName,
  currentTurn,
  word,
  isFake,
  words,
  chat,
  message,
  onMessageChange,
  onSend,
  onLeave,
  onEnd,
  isHost,
  players = []
}) => {
  if (!word || !Array.isArray(words) || words.length === 0) {
    return <div>Loading game...</div>; // avoid blank screen
  }

  return (
    <>
      <TopBar
        playerName={playerName}
        onLeave={onLeave}
        onEnd={onEnd}
        isHost={isHost}
        roomId={localStorage.getItem("roomId")}
      />

      <PlayerList players={players} currentTurn={currentTurn} />

      <WordDisplay word={word} isFake={isFake} words={words} />

      <ChatBox chat={chat} />

      <InputBar
        message={message}
        onChange={onMessageChange}
        onSend={onSend}
        disabled={playerName !== currentTurn}
      />
    </>
  );
};

export default GameScreen;
