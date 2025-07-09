import React from 'react';
import ChatBox from '../components/ChatBox';
import WordDisplay from '../components/WordDisplay';
import TopBar from '../components/TopBar';
import InputBar from '../components/InputBar';

export default function GameScreen({ playerName, currentTurn, word, isFake, words, chat, onSend, onLeave, onEnd, onMessageChange, message, isHost }) {
  return (
    <div>
      <TopBar playerName={playerName} currentTurn={currentTurn} isHost={isHost} onLeave={onLeave} onEnd={onEnd} />
      <WordDisplay word={word} isFake={isFake} words={words} />
      <ChatBox chat={chat} />
      <InputBar value={message} onChange={onMessageChange} onSend={onSend} disabled={playerName !== currentTurn} />
    </div>
  );
}
