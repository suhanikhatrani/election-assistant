import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const initAuth = async () => {
    let token = localStorage.getItem('token');

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) {
          setUser({ id: payload.id, role: payload.role || 'user', email: payload.email });
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error('Error parsing token', e);
      }
    }

    // Token expired or missing — try refresh cookie
    try {
      const res = await api.post('/auth/refresh');
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        const payload = JSON.parse(atob(res.data.token.split('.')[1]));
        setUser({ id: payload.id, role: payload.role || 'user', email: payload.email });
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (err) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { initAuth(); }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('token', res.data.token);
      const payload = JSON.parse(atob(res.data.token.split('.')[1]));
      setUser({ id: payload.id, role: payload.role || 'user', email: payload.email });
    }
    return res.data;
  };

  const register = async (email, password) => {
    const res = await api.post('/auth/register', { email, password });
    if (res.data.success) {
      localStorage.setItem('token', res.data.token);
      const payload = JSON.parse(atob(res.data.token.split('.')[1]));
      setUser({ id: payload.id, role: payload.role || 'user', email: payload.email });
    }
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error', err);
    }
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
