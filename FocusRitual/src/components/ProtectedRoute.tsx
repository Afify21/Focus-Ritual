import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute component - Protects routes from unauthenticated users
 * If user is not authenticated, redirects to login page
 * If user is authenticated, renders the child routes
 */
const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // While checking authentication status, show nothing or a loading spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // If not authenticated and trying to access a protected route, redirect to login
  if (!isAuthenticated && location.pathname !== '/') {
    return <Navigate to="/login" replace />;
  }

  // If authenticated or on main route, render the child routes
  return <Outlet />;
};

export default ProtectedRoute; 