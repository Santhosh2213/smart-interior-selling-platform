import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';

// Public Pages
import LandingPage from '../pages/auth/LandingPage';
import CustomerLogin from '../pages/auth/CustomerLogin';
import CustomerRegister from '../pages/auth/CustomerRegister';
import SellerLogin from '../pages/auth/SellerLogin';
import DesignerLogin from '../pages/auth/DesignerLogin';
import ForgotPassword from '../pages/auth/ForgotPassword';

// Customer Pages
import CustomerDashboard from '../pages/customer/Dashboard';
import CreateProject from '../pages/customer/CreateProject';
import ProjectDetails from '../pages/customer/ProjectDetails';
import QuotationView from '../pages/customer/QuotationView';
import ProfilePage from '../pages/customer/ProfilePage';

// Seller Pages
import SellerDashboard from '../pages/seller/Dashboard';
import ProjectQueue from '../pages/seller/ProjectQueue';
import CreateQuotation from '../pages/seller/CreateQuotation';
import QuotationList from '../pages/seller/QuotationList';
import MaterialDatabase from '../pages/seller/MaterialDatabase';
import GSTSettings from '../pages/seller/GSTSettings';
import OrderManagement from '../pages/seller/OrderManagement';
import Reports from '../pages/seller/Reports';

// Designer Pages
import DesignerDashboard from '../pages/designer/Dashboard';
import ConsultationQueue from '../pages/designer/ConsultationQueue';
import ProjectConsultation from '../pages/designer/ProjectConsultation';
import DesignSuggestions from '../pages/designer/DesignSuggestions';

// Shared/Common Pages
import ChatInterface from '../pages/common/ChatInterface';
import Notifications from '../pages/common/Notifications';
import HelpCenter from '../pages/common/HelpCenter';
import TermsConditions from '../pages/common/TermsConditions';

// Route Guards
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import CustomerRoute from './CustomerRoute';
import SellerRoute from './SellerRoute';
import DesignerRoute from './DesignerRoute';

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/customer/login" element={<PublicRoute><CustomerLogin /></PublicRoute>} />
      <Route path="/customer/register" element={<PublicRoute><CustomerRegister /></PublicRoute>} />
      <Route path="/seller/login" element={<PublicRoute><SellerLogin /></PublicRoute>} />
      <Route path="/designer/login" element={<PublicRoute><DesignerLogin /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

      {/* Customer Routes */}
      <Route path="/customer">
        <Route index element={<Navigate to="/customer/dashboard" replace />} />
        <Route path="dashboard" element={<CustomerRoute><CustomerDashboard /></CustomerRoute>} />
        <Route path="projects/create" element={<CustomerRoute><CreateProject /></CustomerRoute>} />
        <Route path="projects/:id" element={<CustomerRoute><ProjectDetails /></CustomerRoute>} />
        <Route path="quotations/:id" element={<CustomerRoute><QuotationView /></CustomerRoute>} />
        <Route path="profile" element={<CustomerRoute><ProfilePage /></CustomerRoute>} />
      </Route>

      {/* Seller Routes */}
      <Route path="/seller">
        <Route index element={<Navigate to="/seller/dashboard" replace />} />
        <Route path="dashboard" element={<SellerRoute><SellerDashboard /></SellerRoute>} />
        <Route path="queue" element={<SellerRoute><ProjectQueue /></SellerRoute>} />
        <Route path="quotations/create/:projectId" element={<SellerRoute><CreateQuotation /></SellerRoute>} />
        <Route path="quotations" element={<SellerRoute><QuotationList /></SellerRoute>} />
        <Route path="materials" element={<SellerRoute><MaterialDatabase /></SellerRoute>} />
        <Route path="gst" element={<SellerRoute><GSTSettings /></SellerRoute>} />
        <Route path="orders" element={<SellerRoute><OrderManagement /></SellerRoute>} />
        <Route path="reports" element={<SellerRoute><Reports /></SellerRoute>} />
      </Route>

      {/* Designer Routes */}
      <Route path="/designer">
        <Route index element={<Navigate to="/designer/dashboard" replace />} />
        <Route path="dashboard" element={<DesignerRoute><DesignerDashboard /></DesignerRoute>} />
        <Route path="queue" element={<DesignerRoute><ConsultationQueue /></DesignerRoute>} />
        <Route path="consultation/:id" element={<DesignerRoute><ProjectConsultation /></DesignerRoute>} />
        <Route path="suggestions" element={<DesignerRoute><DesignSuggestions /></DesignerRoute>} />
      </Route>

      {/* Common Routes */}
      <Route path="/chat" element={<PrivateRoute><ChatInterface /></PrivateRoute>} />
      <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
      <Route path="/help" element={<HelpCenter />} />
      <Route path="/terms" element={<TermsConditions />} />

      {/* 404 Route */}
      <Route path="*" element={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
            <p className="text-gray-600 mb-8">Page not found</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go Home
            </button>
          </div>
        </div>
      } />
    </Routes>
  );
};

export default AppRoutes;