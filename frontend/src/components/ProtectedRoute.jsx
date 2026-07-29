import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUser } from '../store/slices/authSlice';
import LoadingSpinner from './UI/LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const location = useLocation();

  if (!isAuthenticated && !user) {
    // Check if we are still verifying authentication
    const token = localStorage.getItem('token');
    if (token && !user) {
      // Very basic check, you could render a loading spinner here
      // if your auth state has a 'loading' flag!
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!user?.role || !allowedRoles.includes(user.role)) {
      // Redirect to a specific dashboard or home if role doesn't match
      if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
      if (user?.role === 'seller') return <Navigate to="/seller/dashboard" replace />;
      if (user?.role === 'driver') return <Navigate to="/driver/dashboard" replace />;
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
