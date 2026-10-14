import React, { useState, useEffect, useRef } from 'react';
import '../styles/global.css';

const CarDodgeGame = ({ gameState, currentUser, updateGameState, isHost }) => {
  const players = gameState?.players || [];
  const currentUserId = currentUser?.uid || 'host-1';
  const scores = gameState?.scores || {};
  const gameStatus = gameState?.carDodgeStatus || 'PLAYING'; // 'PLAYING', 'ROUND_OVER'

  const [carLane, setCarLane] = useState(1); // 3 lanes: 0, 1, 2
  const [obstacles, setObstacles] = useState([]);
  const [coins, setCoins] = useState([]);
  const [myScore, setMyScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(true);

  const canvasRef = useRef(null);

  // Game loop timer
  useEffect(() => {
    if (!isPlaying || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsPlaying(false);
          // Submit final score
          const currentScores = gameState?.scores || {};
          const updatedScores = { ...currentScores, [currentUserId]: myScore };
          updateGameState({ scores: updatedScores, carDodgeStatus: 'ROUND_OVER' });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, myScore, currentUserId, gameState?.scores, updateGameState]);

  // Spawner and mover loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      // Move obstacles down
      setObstacles(prev => prev
        .map(obs => ({ ...obs, y: obs.y + 6 }))
        .filter(obs => obs.y < 500)
      );

      // Move coins down
      setCoins(prev => prev
        .map(c => ({ ...c, y: c.y + 6 }))
        .filter(c => c.y < 500)
      );

      // Randomly spawn obstacles or coins
      if (Math.random() < 0.12) {
        const lane = Math.floor(Math.random() * 3);
        setObstacles(prev => [...prev, { id: Date.now() + Math.random(), lane, y: -40 }]);
      }
      if (Math.random() < 0.1) {
        const lane = Math.floor(Math.random() * 3);
        setCoins(prev => [...prev, { id: Date.now() + Math.random(), lane, y: -40 }]);
      }

      // Check collisions
      obstacles.forEach(obs => {
        if (obs.lane === carLane && obs.y > 360 && obs.y < 440) {
          // Hit obstacle!
          setMyScore(s => Math.max(0, s - 5));
          setObstacles(prev => prev.filter(o => o.id !== obs.id));
        }
      });

      coins.forEach(c => {
        if (c.lane === carLane && c.y > 360 && c.y < 440) {
          // Collected coin!
          setMyScore(s => s + 10);
          setCoins(prev => prev.filter(item => item.id !== c.id));
        }
      });

    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, obstacles, coins, carLane]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        setCarLane(l => Math.max(0, l - 1));
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        setCarLane(l => Math.min(2, l + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="glass-card" style={{ width: '100%', maxWidth: '600px', padding: '1.75rem', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--gold-bright)' }}>🚗 CAR DODGE</h3>
        <span className="counter">เวลา: {timeLeft}s | คะแนน: {myScore}</span>
      </div>

      {isPlaying ? (
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '360px',
          height: '440px',
          margin: '0 auto',
          background: 'linear-gradient(180deg, #1b0e1f 0%, #0b0610 100%)',
          border: '2px solid var(--gold-primary)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 0 25px rgba(214, 175, 92, 0.3)'
        }}>
          {/* Road Lanes Dividers */}
          <div style={{ position: 'absolute', left: '33%', top: 0, bottom: 0, width: '2px', background: 'rgba(255,255,255,0.15)', borderStyle: 'dashed' }} />
          <div style={{ position: 'absolute', left: '66%', top: 0, bottom: 0, width: '2px', background: 'rgba(255,255,255,0.15)', borderStyle: 'dashed' }} />

          {/* Render Obstacles */}
          {obstacles.map(obs => (
            <div key={obs.id} style={{
              position: 'absolute',
              left: `${obs.lane * 33 + 8}%`,
              top: `${obs.y}px`,
              width: '28%',
              height: '35px',
              background: 'var(--pressure-red)',
              borderRadius: '8px',
              border: '1px solid #ff6b6b',
              display: 'grid',
              placeItems: 'center',
              fontSize: '0.8rem',
              fontWeight: '900',
              color: '#fff',
              boxShadow: '0 0 10px rgba(230, 57, 70, 0.6)'
            }}>
              🚧 
            </div>
          ))}

          {/* Render Coins */}
          {coins.map(c => (
            <div key={c.id} style={{
              position: 'absolute',
              left: `${c.lane * 33 + 12}%`,
              top: `${c.y}px`,
              width: '20%',
              height: '30px',
              background: 'var(--gold-primary)',
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              fontSize: '0.9rem',
              boxShadow: '0 0 12px var(--gold-bright)'
            }}>
              🪙
            </div>
          ))}

          {/* Render Player Car */}
          <div style={{
            position: 'absolute',
            left: `${carLane * 33 + 8}%`,
            bottom: '20px',
            width: '28%',
            height: '60px',
            background: 'linear-gradient(135deg, var(--gold-dark), var(--gold-primary))',
            borderRadius: '10px',
            border: '2px solid var(--gold-bright)',
            display: 'grid',
            placeItems: 'center',
            fontSize: '1.5rem',
            boxShadow: '0 0 15px rgba(239, 217, 160, 0.6)',
            transition: 'left 0.1s ease'
          }}>
            🏎️
          </div>
        </div>
      ) : (
        <div style={{ padding: '2rem 1rem' }}>
          <h4 style={{ color: 'var(--gold-bright)', fontSize: '1.5rem', marginBottom: '1rem' }}>🏁 จบรอบการแข่งขัน!</h4>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>คะแนนของคุณในรอบนี้: <strong style={{ color: 'var(--gold-bright)', fontSize: '1.5rem' }}>{myScore}</strong> คะแนน</p>
          <button onClick={() => updateGameState({ gameStatus: 'RESULTS' })} className="primary-button">
            ดูผลสรุปคะแนนรวมทั้งหมด →
          </button>
        </div>
      )}

      {/* Touch Control Buttons for Mobile */}
      {isPlaying && (
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.25rem' }}>
          <button 
            onClick={() => setCarLane(l => Math.max(0, l - 1))}
            className="secondary-button"
            style={{ flex: 1, padding: '1rem', fontSize: '1.2rem' }}
          >
            ◀ ซ้าย
          </button>
          <button 
            onClick={() => setCarLane(l => Math.min(2, l + 1))}
            className="secondary-button"
            style={{ flex: 1, padding: '1rem', fontSize: '1.2rem' }}
          >
            ขวา ▶
          </button>
        </div>
      )}
    </div>
  );
};

export default CarDodgeGame;
