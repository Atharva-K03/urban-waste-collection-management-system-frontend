import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false, schedulerOnly = false, workerOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && user.role !== 'ADMIN') {
    return <Navigate to="/unauthorized" />;
  }

  if (schedulerOnly && user.role !== 'SCHEDULER') {
    return <Navigate to="/unauthorized" />;
  }

  if (workerOnly && user.role !== 'SANITARY_WORKER') {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ProtectedRoute;

