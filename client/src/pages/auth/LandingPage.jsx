import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, UserGroupIcon, PaintBrushIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to{' '}
            <span className="text-primary-600">SmartSeller</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your complete platform for construction material quotations, project management, and seamless communication between customers, sellers, and designers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/customer/register"
              className="btn-primary text-lg px-8 py-3"
            >
              Get Started as Customer
            </Link>
            <Link
              to="/customer/login"
              className="btn-secondary text-lg px-8 py-3"
            >
              Login
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <UserGroupIcon className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">For Customers</h3>
            <p className="text-gray-600">
              Create projects, upload photos, get instant quotations, and track your orders seamlessly.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <CurrencyRupeeIcon className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">For Sellers</h3>
            <p className="text-gray-600">
              Manage quotations, track orders, handle GST, and grow your business efficiently.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <PaintBrushIcon className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">For Designers</h3>
            <p className="text-gray-600">
              Provide expert consultations, suggest materials, and help customers make better choices.
            </p>
          </div>
        </div>

        {/* How it Works */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-primary-600 text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">1</div>
              <h4 className="font-semibold mb-2">Create Project</h4>
              <p className="text-gray-600 text-sm">Add measurements and upload wall photos</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-600 text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">2</div>
              <h4 className="font-semibold mb-2">Select Materials</h4>
              <p className="text-gray-600 text-sm">Choose from our material database</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-600 text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">3</div>
              <h4 className="font-semibold mb-2">Get Quotations</h4>
              <p className="text-gray-600 text-sm">Receive competitive quotes from sellers</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-600 text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">4</div>
              <h4 className="font-semibold mb-2">Order & Track</h4>
              <p className="text-gray-600 text-sm">Place orders and track delivery</p>
            </div>
          </div>
        </div>

        {/* Role-based Login */}
        <div className="mt-20 bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-8">Login as</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/customer/login" className="btn-primary px-8 py-3 text-center">
              Customer
            </Link>
            <Link to="/seller/login" className="btn-secondary px-8 py-3 text-center">
              Seller
            </Link>
            <Link to="/designer/login" className="btn-secondary px-8 py-3 text-center">
              Designer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;