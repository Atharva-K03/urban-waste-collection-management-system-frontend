import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const workerId = localStorage.getItem('workerId');
    
    if (token && role && workerId) {
      setUser({ token, role, workerId });
    }
    setLoading(false);
  }, []);

  const login = async (workerId, password) => {
    try {
      const response = await authAPI.login({ workerId, password });
      localStorage.setItem('token', response.token);
      localStorage.setItem('role', response.role);
      localStorage.setItem('workerId', workerId);
      setUser({ token: response.token, role: response.role, workerId });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('workerId');
    setUser(null);
  };

  const isAdmin = () => user?.role === 'ADMIN';
  const isScheduler = () => user?.role === 'SCHEDULER';
  const isWorker = () => user?.role === 'SANITARY_WORKER';

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAdmin,
      isScheduler,
      isWorker,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

