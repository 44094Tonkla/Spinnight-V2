import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGameState } from '../hooks/useGameState.jsx';
import '../styles/global.css';

const JoinRoom = () => {
  const navigate = useNavigate();
  const { joinRoom } = useGameState();
  const [formData, setFormData] = useState({ roomCode: '', playerName: '', avatarId: '1' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const avatars = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.roomCode.trim() || !formData.playerName.trim()) {
      setError('กรุณากรอกรหัสห้องและชื่อของคุณ');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await joinRoom(formData.roomCode.toUpperCase(), formData.playerName, formData.avatarId);
      navigate('/lobby');
    } catch (err) {
      console.error('Error joining room:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการเข้าร่วมห้อง');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ 
      padding: '3rem 1rem 5rem', 
      background: 'radial-gradient(circle at 50% 20%, #33192F 0%, #1B0E1F 60%, #0B0610 100%)', 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      color: 'var(--text-main)',
      position: 'relative'
    }}>
      {/* Main Headline */}
      <h2 className="brand-headline" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '0.5rem', fontWeight: '900', color: 'var(--text-main)' }}>
        JOIN ROOM
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '1.05rem', textAlign: 'center' }}>
        ใส่รหัสห้องเพื่อเข้าร่วมปาร์ตี้กับเพื่อน
      </p>
      
      {/* Form Glass Card */}
      <form onSubmit={handleSubmit} className="glass-card" style={{ 
        width: '100%', 
        maxWidth: '560px', 
        padding: '2.25rem', 
        border: '1px solid var(--burgundy)',
        borderRadius: '18px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.7), 0 0 30px rgba(122, 31, 61, 0.25)'
      }}>
        {error && (
          <div style={{ 
            padding: '0.85rem 1rem', 
            marginBottom: '1.5rem', 
            background: 'rgba(230, 57, 70, 0.15)', 
            border: '1px solid var(--pressure-red)', 
            color: '#FF6B6B', 
            borderRadius: '8px',
            fontSize: '0.9rem',
            textAlign: 'center'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* ROOM CODE Input */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem', fontSize: '0.78rem', letterSpacing: '0.12em', fontWeight: '700' }}>
            ROOM CODE
          </label>
          <input 
            type="text" 
            placeholder="ENTER CODE" 
            value={formData.roomCode}
            required 
            onChange={(e) => setFormData({...formData, roomCode: e.target.value.toUpperCase()})} 
            className="luxury-input"
            style={{ 
              textTransform: 'uppercase', 
              letterSpacing: '0.15em', 
              fontFamily: 'var(--font-serif)', 
              fontSize: '1.25rem',
              textAlign: 'center',
              fontWeight: '700',
              color: 'var(--gold-bright)'
            }}
          />
        </div>

        {/* YOUR NAME Input */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem', fontSize: '0.78rem', letterSpacing: '0.12em', fontWeight: '700' }}>
            YOUR NAME
          </label>
          <input 
            type="text" 
            placeholder="Enter your name" 
            value={formData.playerName}
            required 
            onChange={(e) => setFormData({...formData, playerName: e.target.value})} 
            className="luxury-input"
          />
        </div>
        
        {/* CHOOSE AVATAR */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.75rem', fontSize: '0.78rem', letterSpacing: '0.12em', fontWeight: '700' }}>
            CHOOSE AVATAR
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
            {avatars.map(id => {
              const isSelected = formData.avatarId === id;
              return (
                <div 
                  key={id}
                  onClick={() => setFormData({...formData, avatarId: id})}
                  style={{
                    position: 'relative',
                    aspectRatio: '1',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    padding: '2px',
                    border: isSelected ? '2px solid var(--gold-bright)' : '2px solid var(--burgundy)',
                    boxShadow: isSelected ? '0 0 15px rgba(239, 217, 160, 0.5)' : 'none',
                    transition: 'all 0.25s ease',
                    background: isSelected ? 'rgba(214, 175, 92, 0.2)' : 'rgba(11, 6, 16, 0.5)',
                    transform: isSelected ? 'scale(1.08)' : 'scale(1)'
                  }}
                >
                  <img 
                    src={`/images/avatar/${id}.png`} 
                    alt={`Avatar ${id}`}
                    style={{ 
                      width: '100%', 
                      height: '100%',
                      borderRadius: '50%', 
                      objectFit: 'cover'
                    }} 
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          className="primary-button" 
          disabled={isSubmitting}
          style={{ width: '100%', fontSize: '1rem', padding: '1rem' }}
        >
          {isSubmitting ? 'JOINING ROOM...' : 'JOIN ROOM'}
        </button>

        <p style={{ color: 'var(--text-very-muted)', fontSize: '0.8rem', textAlign: 'center', marginTop: '1.25rem' }}>
          Room not found? Check the code and try again.
        </p>

        {/* Back link */}
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/" style={{ color: 'var(--text-very-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>
            ← Back to Home
          </Link>
        </div>
      </form>
    </div>
  );
};

export default JoinRoom;
