import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const SkeletonCard = () => (
  <div style={{
    height: '100px',
    background: 'rgba(26,18,9,0.04)',
    borderRadius: '4px',
    marginBottom: '1rem',
    animation: 'skeleton-pulse 1.5s ease-in-out infinite'
  }} />
);

const Steps = () => {
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/content/steps');
      setSteps(res.data.data.sort((a, b) => a.stepNumber - b.stepNumber));
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  if (!steps.length) return <div>No steps available.</div>;

  const currentStep = steps[currentStepIndex];

  return (
    <div className="card">
      <span className="small-caps text-muted mb-1" style={{ display: 'block' }}>{currentStep.phase} • Step {currentStep.stepNumber} of {steps.length}</span>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{currentStep.title}</h2>
      
      {currentStep.imageUrl && (
        <img src={currentStep.imageUrl} alt={currentStep.title} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px', marginBottom: '1rem' }} />
      )}
      
      <div style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '2rem' }}>
        <p>{currentStep.body}</p>
      </div>
      
      <div style={{ padding: '1rem', backgroundColor: 'rgba(181,134,13,0.1)', borderLeft: '3px solid var(--gold)', marginBottom: '2rem' }}>
        <span className="small-caps" style={{ color: 'var(--gold)' }}>Key Fact</span>
        <p style={{ fontStyle: 'italic', marginTop: '0.25rem' }}>{currentStep.fact}</p>
      </div>

      <div className="step-nav">
        <button 
          className="btn" 
          disabled={currentStepIndex === 0}
          onClick={() => setCurrentStepIndex(curr => curr - 1)}
        >
          &larr; Previous
        </button>
        <button 
          className="btn btn-primary" 
          disabled={currentStepIndex === steps.length - 1}
          onClick={() => setCurrentStepIndex(curr => curr + 1)}
        >
          Next Step &rarr;
        </button>
      </div>
    </div>
  );
};

export default Steps;
