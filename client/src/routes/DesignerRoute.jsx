import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DesignerRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/designer/login" />;
  }

  if (user.role !== 'designer') {
    return <Navigate to={`/${user.role}/dashboard`} />;
  }

  return children;
};

export default DesignerRoute;