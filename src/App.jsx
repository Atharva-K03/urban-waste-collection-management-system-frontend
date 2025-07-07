import React from 'react';
import { Router, Routes, Route, Navigate, HashRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import AdminDashboard from './components/admin/AdminDashboard';
import SchedulerDashboard from './components/scheduler/SchedulerDashboard';
import WorkerDashboard from './components/worker/WorkerDashboard';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected Routes */}
              <Route 
                path="/wastewise/admin/*" 
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/wastewise/scheduler/*" 
                element={
                  <ProtectedRoute schedulerOnly>
                    <SchedulerDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/wastewise/worker/*" 
                element={
                  <ProtectedRoute workerOnly>
                    <WorkerDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Unauthorized Route */}
              <Route 
                path="/unauthorized" 
                element={
                  <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
                    <div className="text-center">
                      <h1 className="display-1 fw-bold text-danger">403</h1>
                      <h2 className="mb-3">Access Denied</h2>
                      <p className="text-muted mb-4">You don't have permission to access this resource.</p>
                      <a href="/login" className="btn btn-primary">Go to Login</a>
                    </div>
                  </div>
                } 
              />

              {/* Default Route */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

  