import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Define types
interface User {
  userId: string;
  name: string;
  email: string;
  emailVerified: boolean;
  preferences: {
    theme: string;
    notificationsEnabled: boolean;
    focusSessionDefaults: {
      duration: number;
      breakDuration: number;
    }
  };
  createdAt: string;
  lastActive: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  error: string | null;
  setError: (error: string | null) => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

// Provider component
export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      // Configure axios default headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      fetchUserData();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Fetch user data with stored token
  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/auth/me`);
      setUser(response.data.user);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching user data:', err);
      // If token is invalid, clear auth state
      logout();
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });
      
      const { user, token } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', token);
      
      // Set auth state
      setUser(user);
      setToken(token);
      
      // Configure axios default headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      setError(err.response?.data?.error || 'Login failed. Please try again.');
      throw err;
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password
      });
      
      const { user, token } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', token);
      
      // Set auth state
      setUser(user);
      setToken(token);
      
      // Configure axios default headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
      throw err;
    }
  };

  // Logout function
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    
    // Clear auth state
    setUser(null);
    setToken(null);
    
    // Clear axios default headers
    delete axios.defaults.headers.common['Authorization'];
  };

  // Forgot password function
  const forgotPassword = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      setError(err.response?.data?.error || 'Failed to process request. Please try again.');
      throw err;
    }
  };

  // Reset password function
  const resetPassword = async (token: string, newPassword: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await axios.post(`${API_URL}/auth/reset-password`, { 
        token, 
        newPassword 
      });
      
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      setError(err.response?.data?.error || 'Failed to reset password. Please try again.');
      throw err;
    }
  };

  // Context value
  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    error,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 