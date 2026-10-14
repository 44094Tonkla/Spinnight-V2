import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGameState } from '../hooks/useGameState.jsx';
import '../styles/global.css';

const CreateRoom = () => {
  const navigate = useNavigate();
  const { createRoom } = useGameState();
  const [formData, setFormData] = useState({
    playerName: '',
    roomName: 'Friday Night Party',
    avatarId: '1',
    mode: 'CLASSIC',
    category: 'All Categories',
    rounds: 5
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const avatars = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const roundOptions = [3, 5, 7, 10];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.playerName.trim()) {
      setErrorMsg('กรุณากรอกชื่อผู้เล่น');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await createRoom(formData);
      navigate('/room-created');
    } catch (err) {
      console.error('Failed to create room:', err);
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการสร้างห้อง');
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
      {/* Step Indicator */}
      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: '700' }}>
        STEP 01
      </p>

      {/* Headline */}
      <h2 className="brand-headline" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '0.5rem', fontWeight: '900', color: 'var(--text-main)' }}>
        CREATE YOUR ROOM
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '1rem', textAlign: 'center' }}>
        สร้างห้องของคุณเอง แล้วชวนเพื่อนมาร่วมปาร์ตี้
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
        {errorMsg && (
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
            ⚠️ {errorMsg}
          </div>
        )}

        {/* 1. PLAYER NAME */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem', fontSize: '0.78rem', letterSpacing: '0.12em', fontWeight: '700' }}>
            PLAYER NAME
          </label>
          <input 
            type="text" 
            placeholder="ชื่อของคุณ" 
            value={formData.playerName}
            required 
            onChange={(e) => setFormData({...formData, playerName: e.target.value})} 
            className="luxury-input"
          />
        </div>

        {/* 2. ROOM NAME */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem', fontSize: '0.78rem', letterSpacing: '0.12em', fontWeight: '700' }}>
            ROOM NAME
          </label>
          <input 
            type="text" 
            placeholder="Friday Night Party" 
            value={formData.roomName}
            onChange={(e) => setFormData({...formData, roomName: e.target.value})} 
            className="luxury-input"
          />
        </div>
        
        {/* 3. CHOOSE AVATAR */}
        <div style={{ marginBottom: '1.75rem' }}>
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

        {/* 4. GAME MODE */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem', fontSize: '0.78rem', letterSpacing: '0.12em', fontWeight: '700' }}>
            GAME MODE
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setFormData({...formData, mode: 'CLASSIC'})}
              style={{
                padding: '0.85rem',
                borderRadius: '8px',
                border: formData.mode === 'CLASSIC' ? '1px solid var(--gold-primary)' : '1px solid rgba(255,255,255,0.1)',
                background: formData.mode === 'CLASSIC' ? 'var(--burgundy)' : 'var(--bg-dark)',
                color: formData.mode === 'CLASSIC' ? 'var(--text-main)' : 'var(--text-muted)',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '0.85rem',
                letterSpacing: '0.08em',
                transition: 'all 0.25s ease'
              }}
            >
              CLASSIC
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, mode: 'CHAOS'})}
              style={{
                padding: '0.85rem',
                borderRadius: '8px',
                border: formData.mode === 'CHAOS' ? '1px solid var(--gold-primary)' : '1px solid rgba(255,255,255,0.1)',
                background: formData.mode === 'CHAOS' ? 'var(--burgundy)' : 'var(--bg-dark)',
                color: formData.mode === 'CHAOS' ? 'var(--text-main)' : 'var(--text-muted)',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '0.85rem',
                letterSpacing: '0.08em',
                transition: 'all 0.25s ease'
              }}
            >
              CHAOS
            </button>
          </div>
        </div>

        {/* 5. CHALLENGE CATEGORY */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem', fontSize: '0.78rem', letterSpacing: '0.12em', fontWeight: '700' }}>
            CHALLENGE CATEGORY
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            className="luxury-input"
            style={{ cursor: 'pointer' }}
          >
            <option value="All Categories" style={{ background: '#0B0610', color: '#FFF' }}>All Categories</option>
            <option value="Party Drink" style={{ background: '#0B0610', color: '#FFF' }}>Party Drink 🍺</option>
            <option value="Funny Dare" style={{ background: '#0B0610', color: '#FFF' }}>Funny Dare 🤪</option>
            <option value="Truth & Secret" style={{ background: '#0B0610', color: '#FFF' }}>Truth & Secret 🤫</option>
            <option value="Fun Action" style={{ background: '#0B0610', color: '#FFF' }}>Fun Action 🕺</option>
          </select>
        </div>

        {/* 6. NUMBER OF ROUNDS */}
        <div style={{ marginBottom: '2.25rem' }}>
          <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem', fontSize: '0.78rem', letterSpacing: '0.12em', fontWeight: '700' }}>
            NUMBER OF ROUNDS
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
            {roundOptions.map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setFormData({...formData, rounds: r})}
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: formData.rounds === r ? '1px solid var(--gold-bright)' : '1px solid rgba(255,255,255,0.1)',
                  background: formData.rounds === r ? 'var(--burgundy)' : 'var(--bg-dark)',
                  color: formData.rounds === r ? 'var(--gold-bright)' : 'var(--text-muted)',
                  fontWeight: '700',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          className="primary-button" 
          disabled={isSubmitting}
          style={{ width: '100%', fontSize: '1rem', padding: '1rem' }}
        >
          {isSubmitting ? 'CREATING ROOM...' : 'CREATE ROOM'}
        </button>

        {/* Back link */}
        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <Link to="/" style={{ color: 'var(--text-very-muted)', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseEnter={(e) => e.target.style.color = 'var(--text-secondary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-very-muted)'}>
            ← Back to Home
          </Link>
        </div>
      </form>
    </div>
  );
};

export default CreateRoom;
