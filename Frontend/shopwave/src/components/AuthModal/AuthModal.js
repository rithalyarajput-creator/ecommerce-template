import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    let result;
    if (mode === 'login') {
      result = await login(form.email, form.password);
    } else {
      if (!form.name.trim()) { setError('Name required'); setLoading(false); return; }
      result = await register(form.name, form.email, form.password);
    }
    setLoading(false);
    if (result.success) {
      onSuccess && onSuccess();
      onClose();
    } else {
      setError(result.message);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px'
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: '12px', padding: '40px 36px',
        width: '100%', maxWidth: '420px', position: 'relative'
      }} onClick={e => e.stopPropagation()}>

        {/* Close */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16, background: 'none',
          border: 'none', fontSize: 20, cursor: 'pointer', color: '#999'
        }}>✕</button>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img src="https://i.ibb.co/k6vTPq7F/Untitled-design-2.png" alt="Amshine"
            style={{ height: 48, margin: '0 auto 12px' }}
            onError={e => e.target.style.display = 'none'} />
          <h2 style={{
            fontFamily: 'Cormorant Garamond, serif', fontSize: 26,
            fontWeight: 300, color: '#2C1810', marginBottom: 4
          }}>
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ fontSize: 13, color: '#A08060' }}>
            {mode === 'login' ? 'Login to place your order' : 'Register to continue shopping'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca',
            color: '#dc2626', padding: '10px 14px', borderRadius: 6,
            fontSize: 13, marginBottom: 16, textAlign: 'center'
          }}>{error}</div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'register' && (
            <div>
              <label style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#A08060', fontWeight: 600, display: 'block', marginBottom: 6 }}>Full Name *</label>
              <input
                type="text" placeholder="Your full name" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                style={{ width: '100%', border: '1px solid rgba(184,134,11,0.3)', padding: '11px 14px', fontSize: 14, fontFamily: 'Jost, sans-serif', outline: 'none', borderRadius: 4 }}
                required
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#A08060', fontWeight: 600, display: 'block', marginBottom: 6 }}>Email *</label>
            <input
              type="email" placeholder="your@email.com" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              style={{ width: '100%', border: '1px solid rgba(184,134,11,0.3)', padding: '11px 14px', fontSize: 14, fontFamily: 'Jost, sans-serif', outline: 'none', borderRadius: 4 }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#A08060', fontWeight: 600, display: 'block', marginBottom: 6 }}>Password *</label>
            <input
              type="password" placeholder="Min 6 characters" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              style={{ width: '100%', border: '1px solid rgba(184,134,11,0.3)', padding: '11px 14px', fontSize: 14, fontFamily: 'Jost, sans-serif', outline: 'none', borderRadius: 4 }}
              required minLength={6}
            />
          </div>

          <button type="submit" disabled={loading} style={{
            background: '#6B1A2A', color: '#F5E6C0', border: 'none',
            padding: '14px', fontSize: 11, letterSpacing: 3, fontWeight: 600,
            textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Jost, sans-serif',
            borderRadius: 4, marginTop: 4, opacity: loading ? 0.7 : 1
          }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Login & Continue' : 'Create Account'}
          </button>
        </form>

        {/* Toggle */}
        <p style={{ textAlign: 'center', fontSize: 13, color: '#A08060', marginTop: 20 }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            style={{ background: 'none', border: 'none', color: '#6B1A2A', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
            {mode === 'login' ? 'Register here' : 'Login here'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
