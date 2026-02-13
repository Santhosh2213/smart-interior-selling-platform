import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SellerRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/seller/login" />;
  }

  if (user.role !== 'seller') {
    return <Navigate to={`/${user.role}/dashboard`} />;
  }

  return children;
};

export default SellerRoute;