import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const AuthModal = ({ isOpen, onClose }) => {
  const { login, register } = useContext(AuthContext);
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const reset = () => {
    setEmail(''); setPassword(''); setConfirmPassword(''); setError(''); setLoading(false);
  };

  const switchMode = (m) => { setMode(m); reset(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      if (password !== confirmPassword) return setError('Passwords do not match.');
      if (password.length < 6) return setError('Password must be at least 6 characters.');
      if (!/\d/.test(password)) return setError('Password must contain at least one number.');
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password);
      }
      reset();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '.65rem .9rem',
    border: '1px solid rgba(26,18,9,0.25)',
    borderRadius: '4px',
    fontFamily: 'var(--font-body)',
    fontSize: '14px',
    background: 'var(--card-bg)',
    color: 'var(--text-primary)',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '.08em',
    marginBottom: '.35rem'
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(26,18,9,0.55)',
        zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div style={{
        background: 'var(--bg-color, #faf8f5)', border: '1px solid var(--text-primary)',
        borderRadius: '4px', padding: '2rem', width: '100%', maxWidth: '420px',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1.25rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)', lineHeight: 1 }}
        >×</button>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginBottom: '1.5rem' }}>
          {mode === 'login' ? 'Welcome back.' : 'Join the civic conversation.'}
        </h2>

        <div style={{ display: 'flex', marginBottom: '1.5rem', borderBottom: '1px solid rgba(26,18,9,0.1)' }}>
          {['login', 'register'].map(m => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              style={{
                padding: '.5rem 1rem', background: 'none', border: 'none',
                borderBottom: mode === m ? '2px solid var(--accent-red)' : '2px solid transparent',
                fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700,
                cursor: 'pointer', color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '-1px'
              }}
            >
              {m === 'login' ? 'Login' : 'Register'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" style={inputStyle} />
          </div>

          <div style={{ marginBottom: mode === 'register' ? '1rem' : '1.5rem' }}>
            <label style={labelStyle}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min 6 chars, 1 number" style={inputStyle} />
          </div>

          {mode === 'register' && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="Repeat password" style={inputStyle} />
            </div>
          )}

          {error && (
            <div style={{ padding: '.65rem 1rem', background: 'rgba(192,57,43,0.08)', border: '1px solid var(--accent-red)', borderRadius: '4px', color: 'var(--accent-red)', fontSize: '13px', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '.75rem', fontSize: '14px', opacity: loading ? .7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
