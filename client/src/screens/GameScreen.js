import React from 'react';
import TopBar from '../components/TopBar';
import PlayerList from '../components/PlayerList';
import WordDisplay from '../components/WordDisplay';
import ChatBox from '../components/ChatBox';
import InputBar from '../components/InputBar';

function GameScreen({
  roomId,
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
  players
}) {
  return (
    <div style={{ padding: 10 }}>
      <TopBar
        roomId={roomId}
        playerName={playerName}
        isHost={isHost}
        onLeave={onLeave}
        onEnd={onEnd}
      />

      <PlayerList players={players} currentTurn={currentTurn} />

      <WordDisplay word={word} isFake={isFake} words={words} />

      <ChatBox chat={chat} />

      <InputBar
        message={message}
        onChange={onMessageChange}
        onSend={onSend}
        isDisabled={playerName !== currentTurn}
      />
    </div>
  );
}

export default GameScreen;
