import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (user) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'customer') {
      return <Navigate to="/customer/dashboard" replace />;
    } else if (user.role === 'seller') {
      return <Navigate to="/seller/dashboard" replace />;
    } else if (user.role === 'designer') {
      return <Navigate to="/designer/dashboard" replace />;
    }
  }

  return children;
};

export default PublicRoute;