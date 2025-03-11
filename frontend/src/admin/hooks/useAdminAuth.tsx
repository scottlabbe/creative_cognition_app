// src/admin/hooks/useAdminAuth.tsx

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { adminApi } from '../services/adminApi';

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  username: null,
  login: async () => {},
  logout: () => {},
  loading: true
});

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check authentication status on mount
  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await adminApi.verifyToken();
        if (response.valid) {
          setIsAuthenticated(true);
          setUsername(response.username);
        } else {
          // Clear invalid token
          localStorage.removeItem('admin_token');
        }
      } catch (error) {
        console.error('Authentication verification failed:', error);
        localStorage.removeItem('admin_token');
      } finally {
        setLoading(false);
      }
    };
    
    verifyAuth();
  }, []);
  
  // Login function
  const login = async (username: string, password: string): Promise<void> => {
    try {
      const response = await adminApi.login(username, password);
      
      // Store token and update state
      localStorage.setItem('admin_token', response.token);
      setIsAuthenticated(true);
      setUsername(response.username);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };
  
  // Logout function
  const logout = (): void => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
    setUsername(null);
  };
  
  // Provide auth context to children
  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        username, 
        login, 
        logout, 
        loading 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAdminAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  
  return context;
};

export default useAdminAuth;