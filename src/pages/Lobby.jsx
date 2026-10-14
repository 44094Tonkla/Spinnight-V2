import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameState } from '../hooks/useGameState.jsx';
import CardRuleEditor from '../components/CardRuleEditor';
import '../styles/global.css';

const Lobby = () => {
  const navigate = useNavigate();
  const { 
    gameState, 
    currentUser, 
    loading, 
    setGameType, 
    updateCardRules,
    startGame, 
    leaveRoom, 
    toggleReady 
  } = useGameState();

  const [showRuleEditor, setShowRuleEditor] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const players = gameState?.players || [];
  const currentUserId = currentUser?.uid || 'host-1';
  const isHost = !gameState?.hostId || gameState?.hostId === currentUserId || gameState?.hostId === 'host-1';
  const currentPlayer = players.find(p => p.id === currentUserId) || players[0];
  const currentGameType = gameState?.gameType || 'SPIN';

  // Watch for game start and auto navigate to /game
  useEffect(() => {
    if (gameState?.rawStatus === 'playing' || gameState?.status === 'PLAYING') {
      navigate('/game');
    }
  }, [gameState?.rawStatus, gameState?.status, navigate]);

  const playerCount = players.length;

  const handleSetGameType = (type) => {
    if (!isHost) {
      alert("เฉพาะ Host เท่านั้นที่มีสิทธิ์เปลี่ยนเกมได้");
      return;
    }
    setGameType(type);
  };

  const handleStartGame = async () => {
    if (!isHost) {
      alert("เฉพาะ Host เท่านั้นที่มีสิทธิ์เริ่มเกมได้");
      return;
    }
    try {
      await startGame();
      navigate('/game');
    } catch (err) {
      console.error('Failed to start game:', err);
      alert(err.message || 'Failed to start game');
    }
  };

  const handleLeave = async () => {
    await leaveRoom();
    navigate('/');
  };

  const handleCopyCode = () => {
    if (gameState?.roomCode) {
      navigator.clipboard.writeText(gameState.roomCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const getGameLabel = () => {
    if (currentGameType === 'CARD') return 'CARD GAME';
    if (currentGameType === 'NEVER') return 'NEVER HAVE I EVER';
    if (currentGameType === 'BOMB') return 'BOMB ROULETTE';
    return 'WHEEL / SPIN';
  };

  return (
    <div style={{ 
      padding: '2.5rem 1rem 5rem', 
      background: 'radial-gradient(circle at 50% 20%, #33192F 0%, #1B0E1F 60%, #0B0610 100%)', 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      color: 'var(--text-main)',
      position: 'relative'
    }}>

      {/* Header Room Info */}
      <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.25rem', fontWeight: '700' }}>
        ROOM
      </p>

      <h2 className="brand-headline" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', marginBottom: '0.5rem', fontWeight: '900', color: 'var(--text-main)' }}>
        {gameState?.roomName || 'FRIDAY NIGHT CHAOS'}
      </h2>

      {/* Room Code Badge */}
      <div style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '0.75rem', 
        padding: '0.4rem 1.25rem', 
        borderRadius: '8px', 
        background: 'rgba(11, 6, 16, 0.8)',
        border: '1px solid var(--gold-primary)',
        boxShadow: '0 0 15px rgba(214, 175, 92, 0.25)',
        marginBottom: '1rem'
      }}>
        <span style={{ fontSize: '1.25rem', color: 'var(--gold-bright)', fontWeight: '900', letterSpacing: '0.15em', fontFamily: 'var(--font-serif)' }}>
          {gameState?.roomCode || 'SPIN99'}
        </span>
        <button 
          onClick={handleCopyCode} 
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}
          title="Copy Room Code"
        >
          {copiedCode ? 'COPIED' : 'COPY'}
        </button>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2.5rem', letterSpacing: '0.05em' }}>
        Waiting for players... ({playerCount} / 12 Players)
      </p>

      {/* Players List Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
        gap: '1.25rem', 
        width: '100%', 
        maxWidth: '850px', 
        marginBottom: '3rem' 
      }}>
        {players.map(player => {
          const isMe = player.id === currentUserId;
          const avatarSrc = player.avatar || player.avatarId || '1';
          return (
            <div 
              key={player.id} 
              className="glass-card" 
              style={{ 
                padding: '1.25rem 1rem', 
                textAlign: 'center', 
                border: isMe ? '2px solid var(--gold-bright)' : '1px solid var(--glass-border-subtle)',
                boxShadow: isMe ? '0 0 20px rgba(239, 217, 160, 0.3)' : '0 10px 30px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                position: 'relative'
              }}
            >
              {player.isHost && (
                <span style={{ 
                  position: 'absolute', 
                  top: '-10px', 
                  padding: '2px 10px', 
                  background: 'linear-gradient(135deg, var(--gold-dark), var(--gold-primary))', 
                  color: '#0B0610', 
                  fontWeight: '900', 
                  borderRadius: '12px', 
                  fontSize: '0.65rem',
                  letterSpacing: '0.1em',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
                }}>
                  HOST
                </span>
              )}

              <div style={{
                width: '65px',
                height: '65px',
                borderRadius: '50%',
                padding: '2px',
                border: player.isReady ? '2px solid #00E676' : '2px solid var(--burgundy)',
                boxShadow: player.isReady ? '0 0 12px rgba(0, 230, 118, 0.4)' : 'none'
              }}>
                <img 
                  src={`/images/avatar/${avatarSrc}.png`} 
                  alt={player.name} 
                  onError={(e) => { e.target.src = '/images/avatar/1.png'; }}
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
                />
              </div>

              <p style={{ fontWeight: '700', fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', margin: 0 }}>
                {player.name} {isMe && <span style={{ fontSize: '0.75rem', color: 'var(--gold-bright)' }}>(YOU)</span>}
              </p>

              <span style={{ 
                fontSize: '0.72rem', 
                fontWeight: '700', 
                color: player.isReady ? '#00E676' : 'var(--text-muted)',
                letterSpacing: '0.08em'
              }}>
                {player.isReady ? 'READY' : 'WAITING'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Game Settings & Selector Section */}
      <div className="glass-card" style={{ 
        width: '100%', 
        maxWidth: '850px', 
        padding: '1.75rem', 
        marginBottom: '2.5rem',
        border: '1px solid var(--glass-border)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: '700' }}>
            GAME SELECTION & SETTINGS
          </p>
          <span style={{ color: 'var(--gold-primary)', fontSize: '0.85rem', fontWeight: '600' }}>
            {gameState?.mode || 'CLASSIC'} MODE · {gameState?.rounds || 5} ROUNDS
          </span>
        </div>
        
        {/* Game Mode Buttons Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem' }}>
          <button 
            onClick={() => handleSetGameType('SPIN')}
            disabled={!isHost}
            title={isHost ? '' : 'เฉพาะ Host เท่านั้นที่เปลี่ยนเกมได้'}
            style={{ 
              padding: '0.85rem 0.5rem', 
              borderRadius: '10px', 
              border: currentGameType === 'SPIN' ? '2px solid var(--gold-bright)' : '1px solid rgba(255,255,255,0.08)',
              background: currentGameType === 'SPIN' ? 'var(--burgundy)' : 'rgba(11, 6, 16, 0.6)',
              color: currentGameType === 'SPIN' ? 'var(--gold-bright)' : 'var(--text-muted)',
              fontWeight: '700',
              cursor: isHost ? 'pointer' : 'not-allowed',
              opacity: isHost ? 1 : 0.6,
              fontSize: '0.85rem',
              boxShadow: currentGameType === 'SPIN' ? '0 0 15px rgba(239, 217, 160, 0.3)' : 'none',
              transition: 'all 0.25s ease'
            }}
          >
            WHEEL / SPIN
          </button>

          <button 
            onClick={() => handleSetGameType('CARD')}
            disabled={!isHost}
            title={isHost ? '' : 'เฉพาะ Host เท่านั้นที่เปลี่ยนเกมได้'}
            style={{ 
              padding: '0.85rem 0.5rem', 
              borderRadius: '10px', 
              border: currentGameType === 'CARD' ? '2px solid var(--gold-bright)' : '1px solid rgba(255,255,255,0.08)',
              background: currentGameType === 'CARD' ? 'var(--burgundy)' : 'rgba(11, 6, 16, 0.6)',
              color: currentGameType === 'CARD' ? 'var(--gold-bright)' : 'var(--text-muted)',
              fontWeight: '700',
              cursor: isHost ? 'pointer' : 'not-allowed',
              opacity: isHost ? 1 : 0.6,
              fontSize: '0.85rem',
              boxShadow: currentGameType === 'CARD' ? '0 0 15px rgba(239, 217, 160, 0.3)' : 'none',
              transition: 'all 0.25s ease'
            }}
          >
            CARD GAME
          </button>

          <button 
            onClick={() => handleSetGameType('NEVER')}
            disabled={!isHost}
            title={isHost ? '' : 'เฉพาะ Host เท่านั้นที่เปลี่ยนเกมได้'}
            style={{ 
              padding: '0.85rem 0.5rem', 
              borderRadius: '10px', 
              border: currentGameType === 'NEVER' ? '2px solid var(--gold-bright)' : '1px solid rgba(255,255,255,0.08)',
              background: currentGameType === 'NEVER' ? 'var(--burgundy)' : 'rgba(11, 6, 16, 0.6)',
              color: currentGameType === 'NEVER' ? 'var(--gold-bright)' : 'var(--text-muted)',
              fontWeight: '700',
              cursor: isHost ? 'pointer' : 'not-allowed',
              opacity: isHost ? 1 : 0.6,
              fontSize: '0.85rem',
              boxShadow: currentGameType === 'NEVER' ? '0 0 15px rgba(239, 217, 160, 0.3)' : 'none',
              transition: 'all 0.25s ease'
            }}
          >
            NEVER HAVE I
          </button>

          <button 
            onClick={() => handleSetGameType('BOMB')}
            disabled={!isHost}
            title={isHost ? '' : 'เฉพาะ Host เท่านั้นที่เปลี่ยนเกมได้'}
            style={{ 
              padding: '0.85rem 0.5rem', 
              borderRadius: '10px', 
              border: currentGameType === 'BOMB' ? '2px solid var(--gold-bright)' : '1px solid rgba(255,255,255,0.08)',
              background: currentGameType === 'BOMB' ? 'var(--burgundy)' : 'rgba(11, 6, 16, 0.6)',
              color: currentGameType === 'BOMB' ? 'var(--gold-bright)' : 'var(--text-muted)',
              fontWeight: '700',
              cursor: isHost ? 'pointer' : 'not-allowed',
              opacity: isHost ? 1 : 0.6,
              fontSize: '0.85rem',
              boxShadow: currentGameType === 'BOMB' ? '0 0 15px rgba(239, 217, 160, 0.3)' : 'none',
              transition: 'all 0.25s ease'
            }}
          >
            BOMB ROULETTE
          </button>
        </div>

        {/* Card Rule Editor Button */}
        {currentGameType === 'CARD' && (
          <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
            <button 
              onClick={() => setShowRuleEditor(!showRuleEditor)}
              className="secondary-button"
              style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
            >
              {showRuleEditor ? 'ซ่อนการตั้งค่ากฎไพ่' : 'ตั้งค่า/ดูกฎไพ่ & PRESETS'}
            </button>
          </div>
        )}
      </div>

      {/* Card Rule Editor Modal */}
      {showRuleEditor && currentGameType === 'CARD' && (
        <CardRuleEditor 
          currentRules={gameState.cardRules}
          onSaveRules={(newRules) => {
            updateCardRules(newRules);
            setShowRuleEditor(false);
          }}
          isHost={isHost}
          onClose={() => setShowRuleEditor(false)}
        />
      )}
      
      {/* Footer Control Buttons */}
      <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '420px' }}>
        
        {/* Ready toggle */}
        {currentPlayer && (
          <button 
            onClick={() => toggleReady(currentUserId)}
            className="secondary-button" 
            style={{ 
              width: '100%', 
              borderColor: currentPlayer.isReady ? '#00E676' : 'var(--gold-primary)',
              color: currentPlayer.isReady ? '#00E676' : 'var(--gold-primary)'
            }}
          >
            {currentPlayer.isReady ? 'YOU ARE READY (CLICK TO CANCEL)' : 'CLICK TO READY'}
          </button>
        )}

        <button 
          onClick={handleStartGame} 
          disabled={!isHost}
          className="primary-button" 
          title={isHost ? '' : 'เฉพาะ Host เท่านั้นที่เริ่มเกมได้'}
          style={{ width: '100%', fontSize: '1.05rem', padding: '1rem', opacity: isHost ? 1 : 0.6, cursor: isHost ? 'pointer' : 'not-allowed' }}
        >
          {isHost ? `START GAME (${getGameLabel()})` : '🔒 รอ HOST เริ่มเกม... (เฉพาะ Host)'}
        </button>

        <button 
          onClick={handleLeave} 
          style={{ 
            width: '100%', 
            padding: '0.75rem', 
            background: 'transparent', 
            border: '1px solid rgba(255,255,255,0.15)', 
            color: 'var(--text-muted)', 
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: '0.5rem',
            fontSize: '0.85rem'
          }}
        >
          LEAVE ROOM
        </button>
      </div>
    </div>
  );
};

export default Lobby;
