import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import ComplaintDetail from './pages/ComplaintDetail';
import CreateComplaint from './pages/CreateComplaint';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={`/${user.role}-dashboard`} /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to={`/${user.role}-dashboard`} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={`/${user.role}-dashboard`} /> : <Register />} />
      
      <Route
        path="/user-dashboard"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/worker-dashboard"
        element={
          <ProtectedRoute allowedRoles={['worker']}>
            <WorkerDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/complaint/:id"
        element={
          <ProtectedRoute>
            <ComplaintDetail />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/create-complaint"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <CreateComplaint />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
