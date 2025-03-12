// src/admin/components/ProtectedRoute.tsx

import { ReactNode, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAdminAuth } from '../hooks/useAdminAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAdminAuth();
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    // Only redirect if not loading and not authenticated
    if (!loading && !isAuthenticated) {
      // Check directly for token as a fallback
      const hasToken = !!localStorage.getItem('admin_token');
      
      // Only redirect if both auth state is false AND no token exists
      if (!hasToken) {
        setLocation('/admin/login');
      }
    }
  }, [loading, isAuthenticated, setLocation]);
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  // Also check localStorage here
  if (!isAuthenticated && !localStorage.getItem('admin_token')) {
    return null; // useEffect will handle redirect
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;