import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';

const CustomerRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/customer/login" replace />;
  }

  if (user.role !== 'customer') {
    if (user.role === 'seller') {
      return <Navigate to="/seller/dashboard" replace />;
    } else if (user.role === 'designer') {
      return <Navigate to="/designer/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default CustomerRoute;