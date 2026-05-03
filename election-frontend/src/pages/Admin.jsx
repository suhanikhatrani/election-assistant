import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AdminForms from '../components/admin/AdminForms';
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard';

const Admin = () => {
  const { logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel<span style={{color: 'var(--accent-red)'}}>.</span></h2>
          <p style={{fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)'}}>Election Assistant</p>
        </div>
        
        <button className={`sidebar-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>Analytics Dashboard</button>
        <button className={`sidebar-btn ${activeTab === 'glossary' ? 'active' : ''}`} onClick={() => setActiveTab('glossary')}>Glossary</button>
        <button className={`sidebar-btn ${activeTab === 'timeline' ? 'active' : ''}`} onClick={() => setActiveTab('timeline')}>Timeline</button>
        <button className={`sidebar-btn ${activeTab === 'steps' ? 'active' : ''}`} onClick={() => setActiveTab('steps')}>Steps</button>
        <button className={`sidebar-btn ${activeTab === 'quiz' ? 'active' : ''}`} onClick={() => setActiveTab('quiz')}>Quiz</button>
        
        <div style={{marginTop: 'auto'}}>
          <button className="sidebar-btn" style={{width: '100%', color: 'var(--accent-red)'}} onClick={logout}>Logout</button>
        </div>
      </aside>

      <main className="content">
        {activeTab === 'analytics' && <AnalyticsDashboard />}
        {activeTab !== 'analytics' && <AdminForms model={activeTab} />}
      </main>
    </div>
  );
};

export default Admin;
