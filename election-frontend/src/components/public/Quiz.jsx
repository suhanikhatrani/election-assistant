import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const SkeletonCard = () => (
  <div style={{
    height: '100px',
    background: 'rgba(26,18,9,0.04)',
    borderRadius: '4px',
    marginBottom: '1rem',
    animation: 'skeleton-pulse 1.5s ease-in-out infinite'
  }} />
);

const Quiz = () => {
  const { user } = useContext(AuthContext);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [resultMessage, setResultMessage] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/content/quiz');
      setQuestions(res.data.data.sort((a, b) => a.order - b.order));
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelect = (opt) => {
    if (selectedOpt) return; // Prevent double answering
    setSelectedOpt(opt);
    const correct = opt === questions[currentIndex].ans;
    setIsCorrect(correct);
    if (correct) setScore(s => s + 1);
  };

  const handleNext = async () => {
    const isLastQuestion = currentIndex + 1 === questions.length;

    if (isLastQuestion) {
      const finalScore = score + (isCorrect ? 1 : 0);
      setShowResult(true);

      const pct = finalScore / questions.length;
      const message =
        pct === 1 ? "Perfect score! You're a civic expert." :
        pct >= 0.8 ? "Excellent! Strong civic knowledge." :
        pct >= 0.6 ? "Good effort! Review the timeline to improve." :
        "Keep studying — democracy rewards the informed.";
      setResultMessage(message);

      if (user) {
        try {
          await api.post('/progress/quiz', {
            score: finalScore,
            totalQuestions: questions.length
          });
        } catch (err) {
          console.error('Failed to save score:', err);
        }
      }
    } else {
      setCurrentIndex(c => c + 1);
      setSelectedOpt(null);
      setIsCorrect(null);
    }
  };

  if (loading) return (
    <div>
      <style>{`@keyframes skeleton-pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
  
  if (error) return (
    <div style={{
      padding: '2rem',
      textAlign: 'center',
      border: '1px solid var(--accent-red)',
      borderRadius: '4px',
      background: 'rgba(192,57,43,0.03)'
    }}>
      <h3 style={{
        fontFamily: 'var(--font-display)',
        color: 'var(--accent-red)',
        marginBottom: '0.5rem'
      }}>
        Failed to load content
      </h3>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{error}</p>
      <button className="btn btn-primary" onClick={fetchData}>
        Try Again
      </button>
    </div>
  );

  if (!questions.length) return <div>No quiz available.</div>;

  if (showResult) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <h2>Quiz Complete!</h2>
        <p style={{ fontSize: '4rem', color: 'var(--accent-red)', fontFamily: 'var(--font-display)', margin: '1rem 0' }}>
          {score + (isCorrect ? 1 : 0)} / {questions.length}
        </p>
        <p className="text-muted">{resultMessage}</p>
        <button className="btn btn-primary mt-1" onClick={() => window.location.reload()}>Retake Quiz</button>
      </div>
    );
  }

  const q = questions[currentIndex];

  return (
    <div className="card">
      <span className="small-caps text-muted mb-1" style={{ display: 'block' }}>Question {currentIndex + 1} of {questions.length}</span>
      <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>{q.q}</h3>

      {q.imageUrl && (
        <img src={q.imageUrl} alt="Quiz context" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px', marginBottom: '1rem' }} />
      )}

      <div>
        {q.opts.map((opt, idx) => {
          let btnClass = 'quiz-option';
          if (selectedOpt) {
            if (opt === q.ans) btnClass += ' correct';
            else if (opt === selectedOpt) btnClass += ' incorrect';
          }
          return (
            <button 
              key={idx} 
              className={btnClass} 
              onClick={() => handleSelect(opt)}
              disabled={!!selectedOpt}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {selectedOpt && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', borderLeft: `3px solid ${isCorrect ? 'var(--success-green)' : 'var(--accent-red)'}`, backgroundColor: 'rgba(26,18,9,0.02)' }}>
          <p style={{ fontWeight: 700, marginBottom: '0.5rem', color: isCorrect ? 'var(--success-green)' : 'var(--accent-red)' }}>
            {isCorrect ? 'Correct!' : 'Incorrect.'}
          </p>
          <p>{q.exp}</p>
          <button className="btn btn-primary mt-1" onClick={handleNext}>
            {currentIndex + 1 === questions.length ? 'Finish' : 'Next Question'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Quiz;
