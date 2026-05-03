import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const TOTAL_STEPS = 8;

const SkeletonCard = ({ height = '80px' }) => (
  <div style={{
    height,
    background: 'rgba(26,18,9,0.04)',
    borderRadius: '4px',
    animation: 'skeleton-pulse 1.5s ease-in-out infinite'
  }} />
);

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/progress/dashboard');
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getGrade = (score, total) => {
    if (!total) return { label: '-', color: 'var(--text-muted)' };
    const pct = score / total;
    if (pct === 1) return { label: 'Perfect', color: 'var(--success-green)' };
    if (pct >= 0.9) return { label: 'Expert', color: 'var(--success-green)' };
    if (pct >= 0.7) return { label: 'Proficient', color: 'var(--gold)' };
    if (pct >= 0.5) return { label: 'Learning', color: 'var(--text-muted)' };
    return { label: 'Keep Going', color: 'var(--accent-red)' };
  };

  // Normalize data — supports both response shapes:
  // shape A: { completedSteps, quizHistory, totalAttempts, bestScore }
  // shape B: { user: { completedSteps, email }, quizHistory, totalAttempts, bestScore }
  const completedSteps = data?.user?.completedSteps ?? data?.completedSteps ?? [];
  const quizHistory = data?.quizHistory ?? [];
  const totalAttempts = data?.totalAttempts ?? quizHistory.length;
  const bestScore = data?.bestScore ?? 0;
  const userEmail = data?.user?.email ?? user?.email ?? '';

  return (
    <div className="container">
      <style>{`
        @keyframes skeleton-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
        .stat-card { background: var(--card-bg); border: 1px solid rgba(26,18,9,0.1); border-radius: 4px; padding: 1.25rem; text-align: center; }
        .stat-num { font-family: var(--font-display); font-size: 2.5rem; color: var(--accent-red); line-height: 1; }
        .stat-label { font-size: 10px; text-transform: uppercase; letter-spacing: .1em; color: var(--text-muted); margin-top: .35rem; }
        .step-pills { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: 1rem; }
        .step-pill { padding: .35rem .9rem; border-radius: 20px; font-size: 12px; font-weight: 700; border: 1px solid; }
        .pill-done { background: var(--success-green, #2d6a4f); color: white; border-color: var(--success-green, #2d6a4f); }
        .pill-todo { background: transparent; color: var(--text-muted); border-color: rgba(26,18,9,0.15); }
        .history-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .history-table th { text-align: left; padding: .5rem .75rem; font-size: 10px; text-transform: uppercase; letter-spacing: .08em; color: var(--text-muted); border-bottom: 1px solid rgba(26,18,9,0.1); }
        .history-table td { padding: .65rem .75rem; border-bottom: 1px solid rgba(26,18,9,0.06); }
        .history-table tr:last-child td { border-bottom: none; }
        .prog-bar-wrap { height: 6px; background: rgba(26,18,9,0.08); border-radius: 3px; margin-top: .5rem; overflow: hidden; }
        .prog-bar-fill { height: 100%; background: var(--accent-red); border-radius: 3px; transition: width .5s ease; }
        @media(max-width:600px){ .stats-row{grid-template-columns:1fr 1fr;} }
      `}</style>

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '3px double var(--text-primary)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', lineHeight: 1, marginBottom: '.25rem' }}>
            My Progress<span style={{ color: 'var(--accent-red)' }}>.</span>
          </h1>
          <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--text-muted)' }}>
            {userEmail}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '.5rem' }}>
          <button className="btn" onClick={() => navigate('/')}>← Home</button>
          <button className="btn" style={{ color: 'var(--accent-red)', borderColor: 'var(--accent-red)' }} onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="stats-row">
            <SkeletonCard height="100px" />
            <SkeletonCard height="100px" />
            <SkeletonCard height="100px" />
          </div>
          <SkeletonCard height="160px" />
          <SkeletonCard height="200px" />
        </div>
      )}

      {error && (
        <div style={{ padding: '2rem', textAlign: 'center', border: '1px solid var(--accent-red)', borderRadius: '4px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-red)', marginBottom: '.5rem' }}>Could not load dashboard</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{error}</p>
          <button className="btn btn-primary" onClick={fetchDashboard}>Try Again</button>
        </div>
      )}

      {!loading && !error && data && (
        <>
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-num">
                {completedSteps.length}
                <span style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>/{TOTAL_STEPS}</span>
              </div>
              <div className="stat-label">Steps Completed</div>
              <div className="prog-bar-wrap" style={{ marginTop: '.75rem' }}>
                <div className="prog-bar-fill" style={{ width: `${(completedSteps.length / TOTAL_STEPS) * 100}%` }} />
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-num">{totalAttempts}</div>
              <div className="stat-label">Quiz Attempts</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">
                {bestScore}
                <span style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>/10</span>
              </div>
              <div className="stat-label">Best Score</div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '.25rem' }}>Learning Journey</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {completedSteps.length === TOTAL_STEPS
                ? 'All steps completed! You are a civic expert.'
                : `${TOTAL_STEPS - completedSteps.length} steps remaining`}
            </p>
            <div className="step-pills">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(n => (
                <span key={n} className={`step-pill ${completedSteps.includes(n) ? 'pill-done' : 'pill-todo'}`}>
                  {completedSteps.includes(n) ? '✓ ' : ''}Step {n}
                </span>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '1rem' }}>Quiz History</h3>
            {quizHistory.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                No quiz attempts yet.{' '}
                <button
                  className="btn btn-primary"
                  style={{ display: 'inline', padding: '.25rem .75rem', fontSize: '12px' }}
                  onClick={() => navigate('/')}
                >
                  Take the Quiz →
                </button>
              </p>
            ) : (
              <table className="history-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Score</th>
                    <th>Out Of</th>
                    <th>Grade</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {quizHistory.slice(0, 10).map((attempt, idx) => {
                    const grade = getGrade(attempt.score, attempt.totalQuestions);
                    return (
                      <tr key={attempt._id}>
                        <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                        <td style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>{attempt.score}</td>
                        <td>{attempt.totalQuestions}</td>
                        <td><span style={{ color: grade.color, fontWeight: 700, fontSize: '12px' }}>{grade.label}</span></td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                          {new Date(attempt.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
