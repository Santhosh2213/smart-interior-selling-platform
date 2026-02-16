import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HomeIcon,
  FolderIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Square3Stack3DIcon,
  CurrencyRupeeIcon,
  PaintBrushIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const getNavigation = () => {
    const commonNav = [
      { name: 'Dashboard', href: `/${user?.role}/dashboard`, icon: HomeIcon },
      { name: 'Notifications', href: '/notifications', icon: BellIcon },
      { name: 'Chat', href: '/chat', icon: ChatBubbleLeftRightIcon },
      { name: 'Profile', href: `/${user?.role}/profile`, icon: UserCircleIcon },
    ];

    const roleNav = {
      customer: [
        { name: 'My Projects', href: '/customer/dashboard', icon: FolderIcon },
        { name: 'Quotations', href: '/customer/quotations', icon: DocumentTextIcon },
        { name: 'Orders', href: '/customer/orders', icon: Square3Stack3DIcon },
        { name: 'Payments', href: '/customer/payments', icon: CurrencyRupeeIcon },
      ],
      seller: [
        { name: 'Project Queue', href: '/seller/project-queue', icon: FolderIcon },
        { name: 'Quotations', href: '/seller/quotations', icon: DocumentTextIcon },
        { name: 'Materials', href: '/seller/materials', icon: Square3Stack3DIcon },
        { name: 'GST Settings', href: '/seller/gst-settings', icon: CurrencyRupeeIcon },
        { name: 'Customers', href: '/seller/customers', icon: UsersIcon },
        { name: 'Orders', href: '/seller/orders', icon: Square3Stack3DIcon },
        { name: 'Reports', href: '/seller/reports', icon: DocumentTextIcon },
      ],
      designer: [
        { name: 'Consultations', href: '/designer/consultations', icon: FolderIcon },
        { name: 'Projects', href: '/designer/projects', icon: PaintBrushIcon },
        { name: 'Suggestions', href: '/designer/suggestions', icon: DocumentTextIcon },
      ]
    };

    return [...commonNav, ...(roleNav[user?.role] || [])];
  };

  const navigation = getNavigation();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 transform bg-white w-64 shadow-lg z-30
        transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b">
            <span className="text-xl font-bold text-primary-600">SmartSeller</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) => `
                      flex items-center px-4 py-2 text-sm font-medium rounded-lg
                      ${isActive 
                        ? 'bg-primary-50 text-primary-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                    onClick={onClose}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="border-t p-4">
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;