import React, { useState, useEffect } from 'react';
import { QUIZ_QUESTIONS } from '../utils/quizQuestions';
import '../styles/global.css';

const QuickQuizGame = ({ gameState, currentUser, updateGameState, isHost }) => {
  const currentUserId = currentUser?.uid || 'host-1';
  const scores = gameState?.scores || {};

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [myScore, setMyScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Shuffle and pick 10 questions on mount
  useEffect(() => {
    const shuffled = [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10);
    setQuestions(shuffled);
  }, []);

  if (questions.length === 0) return null;

  const currentQ = questions[currentIndex];

  const handleSelectChoice = (choiceIdx) => {
    if (isAnswered || isFinished) return;
    setSelectedChoice(choiceIdx);
    setIsAnswered(true);

    const isCorrect = choiceIdx === currentQ.correctIndex;
    const addedPoints = isCorrect ? 10 : 0;
    const updatedScore = myScore + addedPoints;
    setMyScore(updatedScore);

    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(prev => prev + 1);
        setSelectedChoice(null);
        setIsAnswered(false);
      } else {
        setIsFinished(true);
        const currentScores = gameState?.scores || {};
        const finalScores = { ...currentScores, [currentUserId]: updatedScore };
        updateGameState({ scores: finalScores, quizStatus: 'ROUND_OVER' });
      }
    }, 1200);
  };

  return (
    <div className="glass-card" style={{ width: '100%', maxWidth: '600px', padding: '1.75rem', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--gold-bright)' }}>⚡ QUICK QUIZ</h3>
        <span className="counter">ข้อ {currentIndex + 1} / 10 | คะแนน: {myScore}</span>
      </div>

      {!isFinished ? (
        <div>
          <div style={{
            padding: '1.25rem',
            background: 'rgba(11, 6, 16, 0.75)',
            border: '1px solid var(--gold-primary)',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            fontSize: '1.1rem',
            fontWeight: '700',
            color: 'var(--text-main)',
            lineHeight: 1.5
          }}>
            {currentQ.question}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.25rem' }}>
            {currentQ.choices.map((choice, idx) => {
              let btnBg = 'rgba(11, 6, 16, 0.75)';
              let btnBorder = '1px solid rgba(214, 175, 92, 0.35)';
              if (isAnswered) {
                if (idx === currentQ.correctIndex) {
                  btnBg = 'rgba(0, 230, 118, 0.25)';
                  btnBorder = '1px solid #00E676';
                } else if (idx === selectedChoice) {
                  btnBg = 'rgba(230, 57, 70, 0.25)';
                  btnBorder = '1px solid var(--pressure-red)';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectChoice(idx)}
                  disabled={isAnswered}
                  style={{
                    padding: '1rem',
                    borderRadius: '10px',
                    background: btnBg,
                    border: btnBorder,
                    color: 'var(--text-main)',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    cursor: isAnswered ? 'default' : 'pointer',
                    transition: 'all 0.25s ease'
                  }}
                >
                  {choice}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
              💡 {currentQ.explanation}
            </p>
          )}
        </div>
      ) : (
        <div style={{ padding: '2rem 1rem' }}>
          <h4 style={{ color: 'var(--gold-bright)', fontSize: '1.5rem', marginBottom: '1rem' }}>⚡ ทำแบบทดสอบครบ 10 ข้อแล้ว!</h4>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>คะแนนรวมของคุณ: <strong style={{ color: 'var(--gold-bright)', fontSize: '1.5rem' }}>{myScore}</strong> / 100 คะแนน</p>
          <button onClick={() => updateGameState({ gameStatus: 'RESULTS' })} className="primary-button">
            ดูผลสรุปคะแนนรวมทั้งหมด →
          </button>
        </div>
      )}
    </div>
  );
};

export default QuickQuizGame;
