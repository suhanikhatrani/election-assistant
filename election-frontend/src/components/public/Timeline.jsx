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

const Timeline = () => {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openItem, setOpenItem] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/content/timeline');
      setTimeline(res.data.data);
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

  return (
    <div className="timeline">
      {timeline.map((item) => {
        const isOpen = openItem === item._id;
        return (
          <div key={item._id} className={`tl-item ${item.status}`}>
            <div className="tl-dot" />
            <div
              className={`card tl-card`}
              onClick={() => setOpenItem(isOpen ? null : item._id)}
              style={{ 
                cursor: 'pointer',
                borderLeft: isOpen ? '3px solid var(--accent-red)' : '3px solid transparent'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span className="small-caps text-muted">{item.phase}</span>
                <span className={`pill ${item.status}`}>{item.label}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{item.title}</h3>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', userSelect: 'none' }}>
                  {isOpen ? '▲ Hide details' : '▼ Show details'}
                </span>
              </div>
              <p className="text-muted" style={{ fontSize: '13px' }}>{item.desc}</p>

              <div style={{
                maxHeight: isOpen ? '500px' : '0px',
                overflow: 'hidden',
                transition: 'max-height 0.35s ease-in-out',
              }}>
                <ul style={{
                  listStylePosition: 'inside',
                  color: 'var(--text-muted)',
                  fontSize: '12px',
                  marginTop: '1rem',
                  paddingTop: '1rem',
                  borderTop: '1px dashed rgba(26,18,9,0.15)',
                  paddingLeft: '0'
                }}>
                  {item.details.map((detail, idx) => <li key={idx}>{detail}</li>)}
                </ul>
                
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px', marginTop: '1rem' }} />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
