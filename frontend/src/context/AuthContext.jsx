// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Verify token is still valid
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // You could add a /me endpoint to verify the token
      // For now, we'll assume it's valid
      const userData = localStorage.getItem('userData');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      const response = await api.post('/auth/login', {
        email,
        password
      });

      if (response.data.access_token) {
        // Store token and user data
        localStorage.setItem('authToken', response.data.access_token);
        localStorage.setItem('userData', JSON.stringify(response.data.user));
        
        // Set authorization header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
        
        setUser(response.data.user);
        return { success: true };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (name, email, password) => {
    try {
      setError(null);
      setLoading(true);

      const response = await api.post('/auth/register', {
        name,
        email,
        password
      });

      if (response.data.access_token) {
        // Store token and user data
        localStorage.setItem('authToken', response.data.access_token);
        localStorage.setItem('userData', JSON.stringify(response.data.user));
        
        // Set authorization header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
        
        setUser(response.data.user);
        return { success: true };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    // Clear stored data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    // Remove authorization header
    delete api.defaults.headers.common['Authorization'];
    
    setUser(null);
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    clearError: () => setError(null)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
