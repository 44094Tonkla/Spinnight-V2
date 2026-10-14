import React, { useState, useEffect } from 'react';
import '../styles/global.css';

const EMOJI_PAIRS = ['🍷', '🍸', '🍾', '🍻'];

const MemoryBattleGame = ({ gameState, currentUser, updateGameState, isHost }) => {
  const currentUserId = currentUser?.uid || 'host-1';
  const scores = gameState?.scores || {};

  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [myScore, setMyScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Initialize cards
  useEffect(() => {
    const deck = [...EMOJI_PAIRS, ...EMOJI_PAIRS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, idx) => ({ id: idx, emoji, isFlipped: false }));
    setCards(deck);
  }, []);

  const handleCardClick = (idx) => {
    if (isCompleted) return;
    if (flippedIndices.length === 2) return;
    if (cards[idx].isFlipped || matchedPairs.includes(cards[idx].emoji)) return;

    const newFlipped = [...flippedIndices, idx];
    setFlippedIndices(newFlipped);

    const newCards = cards.map((c, i) => i === idx ? { ...c, isFlipped: true } : c);
    setCards(newCards);

    if (newFlipped.length === 2) {
      const [firstIdx, secondIdx] = newFlipped;
      if (cards[firstIdx].emoji === cards[secondIdx].emoji) {
        // Match found!
        const emoji = cards[firstIdx].emoji;
        setMatchedPairs(prev => {
          const updated = [...prev, emoji];
          const newScore = myScore + 10;
          setMyScore(newScore);

          if (updated.length === EMOJI_PAIRS.length) {
            setIsCompleted(true);
            const currentScores = gameState?.scores || {};
            const finalScores = { ...currentScores, [currentUserId]: newScore };
            updateGameState({ scores: finalScores, memoryStatus: 'ROUND_OVER' });
          }
          return updated;
        });
        setFlippedIndices([]);
      } else {
        // No match, flip back after 800ms
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => (i === firstIdx || i === secondIdx) ? { ...c, isFlipped: false } : c));
          setFlippedIndices([]);
        }, 800);
      }
    }
  };

  return (
    <div className="glass-card" style={{ width: '100%', maxWidth: '550px', padding: '1.75rem', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--gold-bright)' }}>🧠 MEMORY BATTLE</h3>
        <span className="counter">คะแนน: {myScore} | คู่ที่จับได้: {matchedPairs.length} / {EMOJI_PAIRS.length}</span>
      </div>

      {!isCompleted ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          maxWidth: '400px',
          margin: '0 auto 1.5rem'
        }}>
          {cards.map((card, idx) => {
            const isMatched = matchedPairs.includes(card.emoji);
            return (
              <div 
                key={card.id}
                onClick={() => handleCardClick(idx)}
                style={{
                  aspectRatio: '1',
                  borderRadius: '12px',
                  background: card.isFlipped || isMatched ? 'linear-gradient(135deg, var(--burgundy), var(--burgundy-highlight))' : 'rgba(11, 6, 16, 0.85)',
                  border: '2px solid var(--gold-primary)',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '2rem',
                  cursor: isMatched ? 'default' : 'pointer',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                  transition: 'all 0.25s ease',
                  opacity: isMatched ? 0.6 : 1
                }}
              >
                {card.isFlipped || isMatched ? card.emoji : '❓'}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: '2rem 1rem' }}>
          <h4 style={{ color: 'var(--gold-bright)', fontSize: '1.5rem', marginBottom: '1rem' }}>🎉 ยอดเยี่ยม! จับคู่การ์ดครบหมดแล้ว!</h4>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>คะแนนสะสมของคุณ: <strong style={{ color: 'var(--gold-bright)', fontSize: '1.5rem' }}>{myScore}</strong> คะแนน</p>
          <button onClick={() => updateGameState({ gameStatus: 'RESULTS' })} className="primary-button">
            ดูผลสรุปคะแนนรวมทั้งหมด →
          </button>
        </div>
      )}
    </div>
  );
};

export default MemoryBattleGame;
