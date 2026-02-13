import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CustomerRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/customer/login" />;
  }

  if (user.role !== 'customer') {
    return <Navigate to={`/${user.role}/dashboard`} />;
  }

  return children;
};

export default CustomerRoute;