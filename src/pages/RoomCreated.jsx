import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameState } from '../hooks/useGameState.jsx';
import '../styles/global.css';

const RoomCreated = () => {
  const { gameState, loading } = useGameState();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (gameState?.roomCode) {
      navigator.clipboard.writeText(gameState.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    if (navigator.share && gameState?.roomCode) {
      navigator.share({
        title: 'SPINNIGHT - Party Game Room',
        text: `เข้าร่วมปาร์ตี้ SPINNIGHT กับเรา! รหัสห้อง: ${gameState.roomCode}`,
        url: window.location.origin + '/join-room'
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  return (
    <div style={{ 
      padding: '3rem 1rem 5rem', 
      background: 'radial-gradient(circle at 50% 25%, #33192F 0%, #1B0E1F 60%, #0B0610 100%)', 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      color: 'var(--text-main)',
      position: 'relative'
    }}>
      {/* Top Success Checkmark Badge */}
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--gold-dark), var(--gold-primary))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#0B0610',
        fontSize: '2rem',
        fontWeight: '900',
        marginBottom: '1.25rem',
        boxShadow: '0 0 35px rgba(239, 217, 160, 0.5), 0 0 15px rgba(214, 175, 92, 0.4)',
        animation: 'pulseGlow 2.5s infinite alternate'
      }}>
        ✓
      </div>

      {/* Main Headline */}
      <h2 className="brand-headline" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '0.5rem', fontWeight: '900', color: 'var(--text-main)' }}>
        ROOM CREATED
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '1.05rem', textAlign: 'center' }}>
        ห้องของคุณพร้อมแล้ว! ชวนเพื่อนเข้ามาเลย
      </p>

      {/* Room Code Glass Box */}
      <div className="glass-card" style={{ 
        width: '100%', 
        maxWidth: '480px', 
        padding: '2.25rem 2rem', 
        textAlign: 'center',
        border: '1px solid var(--burgundy)',
        borderRadius: '18px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.7), 0 0 30px rgba(122, 31, 61, 0.25)',
        marginBottom: '2rem'
      }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: '700' }}>
          ROOM CODE
        </p>

        {/* Room Code Display */}
        <h1 style={{ 
          fontFamily: 'var(--font-serif)',
          fontSize: '3.5rem', 
          color: 'var(--gold-bright)', 
          margin: '0.25rem 0 0.75rem', 
          letterSpacing: '0.15em',
          fontWeight: '900',
          textShadow: '0 0 20px rgba(239, 217, 160, 0.5)'
        }}>
          {loading ? "LOADING..." : (gameState?.roomCode || "7XK29")}
        </h1>

        {/* Room Config Summary */}
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
          {gameState?.roomName || 'Friday Night Party'} · {gameState?.mode || 'Classic'} · {gameState?.rounds || 5} Rounds
        </p>

        <p style={{ color: 'var(--gold-primary)', fontSize: '0.8rem', letterSpacing: '0.1em', fontWeight: '600', marginBottom: '1.75rem' }}>
          INVITE YOUR FRIENDS
        </p>

        {/* Action Buttons Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
          <button onClick={handleCopy} className="secondary-button" style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
            {copied ? '✓ COPIED!' : '📋 COPY CODE'}
          </button>
          <button onClick={handleShare} className="secondary-button" style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
            🔗 SHARE ROOM
          </button>
        </div>

        <button onClick={() => navigate('/lobby')} className="primary-button" style={{ width: '100%', padding: '0.95rem', fontSize: '1rem' }}>
          ENTER LOBBY →
        </button>
      </div>
    </div>
  );
};

export default RoomCreated;
