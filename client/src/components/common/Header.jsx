import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  HomeIcon, 
  UserCircleIcon, 
  BellIcon, 
  ChatBubbleLeftRightIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    return `/${user.role}/dashboard`;
  };

  const getProfileLink = () => {
    if (!user) return '/';
    return `/${user.role}/profile`;
  };

  if (!user) {
    return (
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <HomeIcon className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">SmartSeller</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/customer/login" className="text-gray-600 hover:text-primary-600">
                Login
              </Link>
              <Link to="/customer/register" className="btn-primary">
                Sign Up
              </Link>
            </div>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to={getDashboardLink()} className="flex items-center space-x-2">
            <HomeIcon className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">SmartSeller</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Link to="/notifications" className="p-2 text-gray-600 hover:text-primary-600 relative">
              <BellIcon className="h-6 w-6" />
              <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                0
              </span>
            </Link>

            {/* Chat */}
            <Link to="/chat" className="p-2 text-gray-600 hover:text-primary-600">
              <ChatBubbleLeftRightIcon className="h-6 w-6" />
            </Link>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 p-2 text-gray-600 hover:text-primary-600 focus:outline-none"
              >
                <UserCircleIcon className="h-6 w-6" />
                <span className="hidden md:inline">{user?.name}</span>
                <ChevronDownIcon className="h-4 w-4" />
              </button>
              
              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border">
                  <Link
                    to={getDashboardLink()}
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to={getProfileLink()}
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Settings
                  </Link>
                  <hr className="my-2" />
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                  >
                    <div className="flex items-center space-x-2">
                      <ArrowRightOnRectangleIcon className="h-5 w-5" />
                      <span>Logout</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;