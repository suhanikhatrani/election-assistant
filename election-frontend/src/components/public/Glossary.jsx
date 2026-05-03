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

const Glossary = () => {
  const [terms, setTerms] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/content/glossary${query ? `?search=${query}` : ''}`);
      setTerms(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div>
      <style>{`@keyframes skeleton-pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      <div className="search-container" style={{ marginBottom: '1.5rem' }}>
        <input 
          type="text" 
          className="search-input" 
          placeholder="Search the glossary..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {error && (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          border: '1px solid var(--accent-red)',
          borderRadius: '4px',
          background: 'rgba(192,57,43,0.03)',
          marginBottom: '1rem'
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
      )}

      {loading && !error && (
        <div>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}
      
      {!loading && !error && terms.length === 0 && (
        <div className="card text-center text-muted">No terms found.</div>
      )}

      {!loading && !error && terms.map(item => (
        <div className="card mb-1" key={item._id}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{item.term}</h3>
          <p>{item.def}</p>
        </div>
      ))}
    </div>
  );
};

export default Glossary;
