import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';

const SellerRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/seller/login" replace />;
  }

  if (user.role !== 'seller') {
    if (user.role === 'customer') {
      return <Navigate to="/customer/dashboard" replace />;
    } else if (user.role === 'designer') {
      return <Navigate to="/designer/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default SellerRoute;