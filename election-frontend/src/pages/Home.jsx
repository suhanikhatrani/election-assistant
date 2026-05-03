import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Timeline from '../components/public/Timeline';
import Steps from '../components/public/Steps';
import Glossary from '../components/public/Glossary';
import Quiz from '../components/public/Quiz';
import AuthModal from '../components/public/AuthModal';

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('timeline');
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="container">
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />

      <header className="masthead">
        <div className="top-bar">
          <span>Vol. I — No. 1</span>
          <span>The Civic Literacy Series</span>
          {user ? (
            <span
              onClick={() => navigate('/dashboard')}
              style={{ cursor: 'pointer', color: 'var(--accent-red)', fontWeight: 700 }}
            >
              My Progress →
            </span>
          ) : (
            <span
              onClick={() => setAuthOpen(true)}
              style={{ cursor: 'pointer', color: 'var(--accent-red)', fontWeight: 700 }}
            >
              Login / Register
            </span>
          )}
        </div>
        <h1 className="main-title">The Election<span className="dot">.</span></h1>
        <p className="subtitle">A definitive guide to the democratic process</p>
      </header>

      <div className="tabs">
        {['timeline', 'steps', 'glossary', 'quiz'].map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'timeline' ? 'Timeline' :
             tab === 'steps' ? 'The Process' :
             tab === 'glossary' ? 'Glossary' : 'Test Knowledge'}
          </button>
        ))}
      </div>

      <div className="content-area">
        {activeTab === 'timeline' && <Timeline />}
        {activeTab === 'steps' && <Steps />}
        {activeTab === 'glossary' && <Glossary />}
        {activeTab === 'quiz' && <Quiz />}
      </div>
    </div>
  );
};

export default Home;
