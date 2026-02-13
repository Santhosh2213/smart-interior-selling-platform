import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = ({ children }) => {
  const { user } = useAuth();

  if (user) {
    // Redirect based on role
    if (user.role === 'customer') {
      return <Navigate to="/customer/dashboard" />;
    } else if (user.role === 'seller') {
      return <Navigate to="/seller/dashboard" />;
    } else if (user.role === 'designer') {
      return <Navigate to="/designer/dashboard" />;
    }
  }

  return children;
};

export default PublicRoute;