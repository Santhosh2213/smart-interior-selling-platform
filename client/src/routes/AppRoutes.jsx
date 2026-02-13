import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Auth Pages
import LandingPage from '../pages/auth/LandingPage';
import CustomerLogin from '../pages/auth/CustomerLogin';
import SellerLogin from '../pages/auth/SellerLogin';
import DesignerLogin from '../pages/auth/DesignerLogin';
import CustomerRegister from '../pages/auth/CustomerRegister';
import ForgotPassword from '../pages/auth/ForgotPassword';

// Customer Pages
import CustomerDashboard from '../pages/customer/Dashboard';
import CreateProject from '../pages/customer/CreateProject';
import ProjectDetails from '../pages/customer/ProjectDetails';
import MaterialSelection from '../pages/customer/MaterialSelection';
import QuotationView from '../pages/customer/QuotationView';

// Seller Pages
import SellerDashboard from '../pages/seller/Dashboard';
import ProjectQueue from '../pages/seller/ProjectQueue';
import CreateQuotation from '../pages/seller/CreateQuotation';
import QuotationList from '../pages/seller/QuotationList';
import GSTSettings from '../pages/seller/GSTSettings';

// Designer Pages
import DesignerDashboard from '../pages/designer/Dashboard';
import ConsultationQueue from '../pages/designer/ConsultationQueue';
import ProjectConsultation from '../pages/designer/ProjectConsultation';
import DesignSuggestions from '../pages/designer/DesignSuggestions';

// Common Pages
import ChatInterface from '../pages/common/ChatInterface';
import Notifications from '../pages/common/Notifications';

// Route Guards
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import CustomerRoute from './CustomerRoute';
import SellerRoute from './SellerRoute';
import DesignerRoute from './DesignerRoute';

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/login" element={<Navigate to="/customer/login" />} />
      <Route path="/customer/login" element={<PublicRoute><CustomerLogin /></PublicRoute>} />
      <Route path="/seller/login" element={<PublicRoute><SellerLogin /></PublicRoute>} />
      <Route path="/designer/login" element={<PublicRoute><DesignerLogin /></PublicRoute>} />
      <Route path="/customer/register" element={<PublicRoute><CustomerRegister /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

      {/* Customer Routes */}
      <Route path="/customer/dashboard" element={
        <CustomerRoute>
          <CustomerDashboard />
        </CustomerRoute>
      } />
      <Route path="/customer/projects/create" element={
        <CustomerRoute>
          <CreateProject />
        </CustomerRoute>
      } />
      <Route path="/customer/projects/:id" element={
        <CustomerRoute>
          <ProjectDetails />
        </CustomerRoute>
      } />
      <Route path="/customer/projects/:id/materials" element={
        <CustomerRoute>
          <MaterialSelection />
        </CustomerRoute>
      } />
      <Route path="/customer/quotation/:id" element={
        <CustomerRoute>
          <QuotationView />
        </CustomerRoute>
      } />

      {/* Seller Routes */}
      <Route path="/seller/dashboard" element={
        <SellerRoute>
          <SellerDashboard />
        </SellerRoute>
      } />
      <Route path="/seller/project-queue" element={
        <SellerRoute>
          <ProjectQueue />
        </SellerRoute>
      } />
      <Route path="/seller/create-quotation/:projectId" element={
        <SellerRoute>
          <CreateQuotation />
        </SellerRoute>
      } />
      <Route path="/seller/quotations" element={
        <SellerRoute>
          <QuotationList />
        </SellerRoute>
      } />
      <Route path="/seller/gst-settings" element={
        <SellerRoute>
          <GSTSettings />
        </SellerRoute>
      } />

      {/* Designer Routes */}
      <Route path="/designer/dashboard" element={
        <DesignerRoute>
          <DesignerDashboard />
        </DesignerRoute>
      } />
      <Route path="/designer/consultations" element={
        <DesignerRoute>
          <ConsultationQueue />
        </DesignerRoute>
      } />
      <Route path="/designer/project/:id" element={
        <DesignerRoute>
          <ProjectConsultation />
        </DesignerRoute>
      } />
      <Route path="/designer/suggestions/:projectId" element={
        <DesignerRoute>
          <DesignSuggestions />
        </DesignerRoute>
      } />

      {/* Common Routes */}
      <Route path="/chat/:projectId?" element={
        <PrivateRoute>
          <ChatInterface />
        </PrivateRoute>
      } />
      <Route path="/notifications" element={
        <PrivateRoute>
          <Notifications />
        </PrivateRoute>
      } />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;