import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import api from '../../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const SkeletonCard = () => (
  <div style={{
    height: '200px',
    background: 'rgba(26,18,9,0.04)',
    borderRadius: '4px',
    marginBottom: '1rem',
    animation: 'skeleton-pulse 1.5s ease-in-out infinite'
  }} />
);

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overview, quiz, users] = await Promise.all([
        api.get('/admin/analytics/overview'),
        api.get('/admin/analytics/quiz'),
        api.get('/admin/analytics/users')
      ]);
      
      setData({
        overview: overview.data.data,
        quiz: quiz.data.data,
        users: users.data.data
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load analytics.');
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

  if (!data) return null;

  const activityData = {
    labels: data.quiz.activityOverTime.map(d => d._id),
    datasets: [{
      label: 'Quiz Attempts',
      data: data.quiz.activityOverTime.map(d => d.attempts),
      borderColor: '#c0392b',
      tension: 0.1
    }]
  };

  const scoreData = {
    labels: data.quiz.scoreDistribution.map(d => `Score: ${d._id}`),
    datasets: [{
      label: 'Number of Users',
      data: data.quiz.scoreDistribution.map(d => d.count),
      backgroundColor: '#b5860d'
    }]
  };

  const stepData = {
    labels: data.users.stepCompletion.map(d => `${d._id} Steps Done`),
    datasets: [{
      data: data.users.stepCompletion.map(d => d.users),
      backgroundColor: ['#1a1209', '#c0392b', '#b5860d', '#1a4a2e', '#6b6154']
    }]
  };

  return (
    <div>
      <div className="header-actions">
        <h2>Overview Analytics</h2>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card"><h3>Total Users</h3><p>{data.overview.totalUsers}</p></div>
        <div className="stat-card"><h3>Quiz Attempts</h3><p>{data.overview.totalAttempts}</p></div>
        <div className="stat-card"><h3>Average Score</h3><p>{data.overview.averageScore}</p></div>
      </div>
      
      <div className="charts-grid">
        <div className="chart-container">
          <Line options={{ responsive: true, plugins: { title: { display: true, text: 'Activity Over Time' } } }} data={activityData} />
        </div>
        <div className="chart-container">
          <Bar options={{ responsive: true, plugins: { title: { display: true, text: 'Score Distribution' } } }} data={scoreData} />
        </div>
      </div>
      
      <div className="charts-grid" style={{ marginTop: '1rem', gridTemplateColumns: '1fr' }}>
        <div className="chart-container" style={{ maxHeight: '400px', display: 'flex', justifyContent: 'center' }}>
          <Pie options={{ responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'Step Completion Breakdown' } } }} data={stepData} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
