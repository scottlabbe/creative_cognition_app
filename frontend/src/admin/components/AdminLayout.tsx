// src/admin/components/AdminLayout.tsx

import React, { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useAdminAuth } from '../hooks/useAdminAuth';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const { logout, username } = useAdminAuth();

  const handleLogout = () => {
    logout();
    // No need to navigate, the ProtectedRoute will handle that
  };

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">
              Learning Styles Admin
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {username && <span className="text-gray-600">Logged in as {username}</span>}
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar and Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white shadow rounded-lg p-4">
              <nav className="space-y-1">
                <Link href="/admin">
                  <a className={`block px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/admin')
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}>
                    Dashboard
                  </a>
                </Link>
                <Link href="/admin/submissions">
                  <a className={`block px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/admin/submissions') || location.startsWith('/admin/submissions/')
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}>
                    Submissions
                  </a>
                </Link>
                <Link href="/admin/simulator">
                  <a className={`block px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/admin/simulator')
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}>
                    Score Simulator
                  </a>
                </Link>
                <div className="border-t border-gray-200 my-2"></div>
                <Link href="/">
                  <a className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                    View Public Site
                  </a>
                </Link>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white shadow rounded-lg p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;